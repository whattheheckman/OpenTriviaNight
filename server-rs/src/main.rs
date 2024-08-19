mod actions;
mod dto;
mod models;

use std::{borrow::Borrow, net::SocketAddr, sync::Arc, time::Duration};

use actions::{handle_game_request, GameError};
use axum::{
    body::Body,
    extract::{
        ws::{CloseFrame, Message, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    http::Response,
    routing::{get, post},
    Json, Router,
};
use dashmap::DashMap;
use dto::{CreateGameRequest, GameMessage, StatsResponse, UpdateGameRequest};
use futures::{SinkExt, StreamExt};
use models::{AppState, Game, PlayerRole};
use tokio::{sync::broadcast::error::RecvError, time::Instant};
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState {
        games: Arc::new(DashMap::new()),
    };

    start_cleanup_old_games(state.clone());

    let serve_dir =
        ServeDir::new("wwwroot").not_found_service(ServeFile::new("wwwroot/index.html"));

    let app = Router::new()
        .nest_service("/", serve_dir.clone())
        .route("/api/stats", get(get_stats))
        .route("/api/games", post(create_game))
        .route("/api/stream/games/:game_id/:role/:username", get(join_game))
        .route("/api/games/:game_id", get(get_game))
        .fallback_service(serve_dir)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        )
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

async fn get_stats(State(state): State<AppState>) -> StatsResponse {
    return StatsResponse {
        games_count: state.games.len(),
    };
}

async fn create_game(
    State(state): State<AppState>,
    Json(new_game): Json<CreateGameRequest>,
) -> Result<Game, GameError> {
    return state.create_game(new_game);
}

async fn get_game(
    Path(game_id): Path<String>,
    State(state): State<AppState>,
) -> Result<Game, GameError> {
    match state.games.get(&game_id.to_ascii_uppercase()) {
        Some(x) => return Ok(x.value().game.clone()),
        None => return Err(GameError::GameNotFound),
    }
}

async fn join_game(
    Path((game_id, role, username)): Path<(String, PlayerRole, String)>,
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> Response<Body> {
    tracing::debug!("{username} is attempting to join game {game_id} as a {role:?}");
    return ws.on_upgrade(move |socket| handle_socket(socket, game_id, username, role, state));
}

async fn handle_socket(
    socket: WebSocket,
    game_id: String,
    username: String,
    role: PlayerRole,
    state: AppState,
) {
    let (mut ws_tx, mut ws_rx) = socket.split();

    match state
        .clone()
        .join_game(game_id.clone(), username.clone(), role.clone())
    {
        Ok(_) => {}
        Err(e) => {
            let _ = ws_tx
                .send(Message::Close(Some(CloseFrame {
                    code: 3002,
                    reason: std::borrow::Cow::Borrowed(&e.get_message()),
                })))
                .await;
            return;
        }
    }
    let games = state.clone().games;

    let ws_tx_games = games.clone();
    let ws_tx_game_id = game_id.clone();
    let ws_tx_username = username.clone();
    let mut ws_tx_task = tokio::spawn(async move {
        let game_entry = match ws_tx_games.get_mut(&ws_tx_game_id.to_ascii_uppercase()) {
            Some(x) => x,
            None => return,
        };

        // Send the current game start to initialise the client
        if let Ok(serialized) = serde_json::to_string(&GameMessage::JoinGame {
            game: game_entry.game.borrow().into(),
        }) {
            if let Err(e) = ws_tx.send(Message::Text(serialized)).await {
                tracing::warn!(
                    "Error sending game init payload for {ws_tx_game_id} to {ws_tx_username}: {e}"
                );
                return;
            }
        }

        let mut game_events_rx = game_entry.sender.subscribe();

        // Ensure we release the lock on the game now that we have the channel set up
        drop(game_entry);

        // Listen for updates on the games channel and send them to the client
        loop {
            let update = match game_events_rx.recv().await {
                Ok(x) => x,
                Err(err) => {
                    if let RecvError::Lagged(_) = err {
                        tracing::info!(
                            "Channel for game {ws_tx_game_id} to {ws_tx_username} lagged"
                        );
                        continue;
                    } else {
                        tracing::debug!(
                            "Channel for game {ws_tx_game_id} to {ws_tx_username} closed"
                        );
                        return;
                    }
                }
            };

            match update {
                GameMessage::EndSession { username } => {
                    if username == ws_tx_username {
                        let _ = ws_tx
                            .send(Message::Close(Some(CloseFrame {
                                code: 3001,
                                reason: std::borrow::Cow::Borrowed(
                                    "User requested to leave the game",
                                ),
                            })))
                            .await;
                        return;
                    }
                }
                GameMessage::Pong { username } => {
                    // Implementing our own ping/pong until I figure out a better way
                    if username == ws_tx_username {
                        let _ = ws_tx.send(Message::Pong("pong".into())).await;
                    }
                }
                _ => {
                    if let Ok(serialized) = serde_json::to_string(&update) {
                        if let Err(e) = ws_tx.send(Message::Text(serialized)).await {
                            tracing::warn!(
                                "Error sending game update for {ws_tx_game_id} to {ws_tx_username}: {e}"
                            );
                        }
                    }
                }
            }
        }
    });

    let ws_rx_games = games.clone();
    let ws_rx_game_id = game_id.clone();
    let ws_rx_username = username.clone();
    let mut ws_rx_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_rx.next().await {
            if let Message::Ping(_payload) = msg {
                // do nothing
            } else if let Message::Text(text) = msg {
                tracing::debug!(
                    "Received message from {ws_rx_username} for game {ws_rx_game_id}: {text}"
                );
                let request = match serde_json::from_str::<UpdateGameRequest>(text.as_str()) {
                    Ok(x) => x,
                    Err(e) => {
                        tracing::warn!("Failed to parse the message from {ws_rx_username} for game {ws_rx_game_id}: {text}: {e}");
                        continue;
                    }
                };

                let mut game_entry = match ws_rx_games.get_mut(&ws_rx_game_id.to_ascii_uppercase())
                {
                    Some(x) => x,
                    None => return,
                };

                handle_game_request(
                    &mut game_entry,
                    ws_rx_username.clone(),
                    role.clone(),
                    request,
                );
            }
        }
        return;
    });

    tokio::select! {
        _ = (&mut ws_tx_task) => ws_rx_task.abort(),
        _ = (&mut ws_rx_task) => ws_tx_task.abort(),
    }

    tracing::info!("Websocket closed for {username} in game {game_id}");
}

fn start_cleanup_old_games(state: AppState) {
    tokio::spawn(async move {
        // Cleanup old games on a schedule
        let mut interval = tokio::time::interval(Duration::from_secs(60));
        loop {
            interval.tick().await;
            tracing::debug!("Searching for stale games to remove");
            let now = Instant::now();
            // Find games that haven't been updated in more than 30 mins
            let stale_games: Vec<String> = state
                .games
                .iter()
                .filter(|x| now.duration_since(x.last_updated) > Duration::from_secs(1800))
                .map(|x| x.key().clone())
                .collect();

            for game_id in stale_games {
                tracing::info!("Removing game {game_id} as it is stale");
                state.games.remove(&game_id);
            }
        }
    });
}

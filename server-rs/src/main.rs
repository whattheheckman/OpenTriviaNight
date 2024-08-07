mod actions;
mod dto;
mod models;

use std::{net::SocketAddr, sync::Arc};

use actions::{handle_game_request, GameError};
use axum::{
    body::Body,
    extract::{
        ws::{Message, WebSocket},
        Path, Query, State, WebSocketUpgrade,
    },
    http::Response,
    routing::{get, post},
    Json, Router,
};
use dashmap::DashMap;
use dto::{CreateGameRequest, GameMessage, UpdateGameRequest};
use futures::{SinkExt, StreamExt};
use models::{AppState, Game, GameEntry, GameState, PlayerRole};
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_websockets=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState {
        games: Arc::new(DashMap::new()),
    };

    let app = Router::new()
        .route("/games", post(create_game))
        .route("/games/:game_id", get(join_game))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        )
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

async fn create_game(
    State(state): State<AppState>,
    Json(new_game): Json<CreateGameRequest>,
) -> Result<Game, GameError> {
    return state.create_game(new_game);
}

async fn join_game(
    ws: WebSocketUpgrade,
    Path(game_id): Path<String>,
    Query(username): Query<String>,
    Query(role): Query<PlayerRole>,
    State(state): State<AppState>,
) -> Result<Response<Body>, GameError> {
    match state
        .clone()
        .join_game(game_id.clone(), username.clone(), role.clone())
    {
        Ok(_) => {}
        Err(e) => return Err(e),
    }
    // finalize the upgrade process by returning upgrade callback.
    // we can customize the callback by sending additional info such as address.
    return Ok(
        ws.on_upgrade(move |socket| handle_socket(socket, game_id, username, role, state.games))
    );
}

async fn handle_socket(
    mut socket: WebSocket,
    game_id: String,
    username: String,
    role: PlayerRole,
    games: Arc<DashMap<String, GameEntry>>,
) {
    let _ = games;
    if socket.send(Message::Ping(vec![1, 2, 3])).await.is_ok() {
        tracing::debug!("Pinged new joiner {username} in game {game_id}...");
    } else {
        tracing::error!("Could not send ping to {username} in game {game_id}");
        // no Error here since the only thing we can do is to close the connection.
        return;
    }

    let (mut sender, mut receiver) = socket.split();

    let send_games = games.clone();
    let send_game_id = game_id.clone();
    let send_username = username.clone();
    let mut send_task = tokio::spawn(async move {
        let entry = match send_games.get_mut(&send_game_id) {
            Some(x) => x,
            None => return,
        };

        // init the game by sending the current state to the client
        if let Ok(serialized) = serde_json::to_string(&GameMessage::JoinGame {
            game: entry.game.clone(),
        }) {
            if let Err(e) = sender.send(Message::Text(serialized)).await {
                tracing::error!(
                    "Error sending game init info for {send_game_id} to {send_username}: {e}"
                );
                return;
            }
        }

        // Whilst the game is in progress, listen for updates on the games channel and send them to the client
        while entry.game.state != GameState::Finished {
            let mut receiver = entry.sender.subscribe();
            let update = match receiver.recv().await {
                Ok(x) => x,
                Err(_) => return,
            };
            if let Ok(serialized) = serde_json::to_string(&update) {
                if let Err(e) = sender.send(Message::Text(serialized)).await {
                    tracing::warn!(
                        "Error sending game update for {send_game_id} to {send_username}: {e}"
                    )
                }
            }
        }
    });

    let recv_games = games.clone();
    let recv_game_id = game_id.clone();
    let recv_username = username.clone();
    let mut recv_task = tokio::spawn(async move {
        let mut game_entry = match recv_games.get_mut(&recv_game_id) {
            Some(x) => x,
            None => return,
        };
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Text(text) = msg {
                tracing::debug!(
                    "Received message from {recv_username} for game {recv_game_id}: {text}"
                );
                let request = match serde_json::from_str::<UpdateGameRequest>(text.as_str()) {
                    Ok(x) => x,
                    Err(_) => continue,
                };

                if let UpdateGameRequest::LeaveGame = request {
                    // Special handling for leaving game, just end the websocket session
                    return;
                }

                handle_game_request(
                    &mut game_entry,
                    recv_username.clone(),
                    role.clone(),
                    request,
                );
            }
        }
        return;
    });

    tokio::select! {
        rv_a = (&mut send_task) => {
            match rv_a {
                Ok(_) => tracing::debug!("Send Websocket ended for {username} in game {game_id}"),
                Err(a) => tracing::debug!("Error sending messages for {username} in game {game_id} {a:?}")
            }
            recv_task.abort();
        },
        rv_b = (&mut recv_task) => {
            match rv_b {
                Ok(_) => tracing::debug!("Send Websocket ended for {username} in game {game_id}"),
                Err(b) => tracing::debug!("Error receiving messages for {username} in game {game_id} {b:?}")
            }
            send_task.abort();
        }
    }

    tracing::info!("Websocket context destroyed for {username} in game {game_id}");
}

mod models;

use std::{net::SocketAddr, sync::Arc};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use dashmap::DashMap;
use futures::{SinkExt, StreamExt};
use models::{AppState, GameEntry, GameState};
use serde::Serialize;
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
        .route("/games/:gameId", get(join_game))
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

async fn join_game(
    ws: WebSocketUpgrade,
    Path(game_id): Path<String>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    // finalize the upgrade process by returning upgrade callback.
    // we can customize the callback by sending additional info such as address.
    ws.on_upgrade(move |socket| handle_socket(socket, game_id, state.games))
}

async fn handle_socket(
    mut socket: WebSocket,
    game_id: String,
    games: Arc<DashMap<String, GameEntry>>,
) {
    let _ = games;
    if socket.send(Message::Ping(vec![1, 2, 3])).await.is_ok() {
        println!("Pinged new joiner...");
    } else {
        println!("Could not send ping!");
        // no Error here since the only thing we can do is to close the connection.
        // If we can not send messages, there is no way to salvage the statemachine anyway.
        return;
    }

    let (mut sender, mut receiver) = socket.split();

    let send_games = games.clone();
    let send_game_id = game_id.clone();
    let mut send_task = tokio::spawn(async move {
        let entry = match send_games.get_mut(&send_game_id) {
            Some(x) => x,
            None => return,
        };

        while entry.game.state != GameState::Finished {
            let receiver = entry.sender.subscribe();
            let update = match receiver.recv().await {
                Ok(x) => x,
                Err(_) => return,
            };
            if let Ok(serialized) = serde_json::to_string(&update) {
                sender.send(Message::Text(serialized));
            }
        }
    });

    let recv_games = games.clone();
    let recv_game_id = game_id.clone();
    let mut recv_task = tokio::spawn(async move {
        let game = match recv_games.get_mut(&recv_game_id) {
            Some(x) => x,
            None => return,
        };
        let mut cnt = 0;
        while let Some(Ok(msg)) = receiver.next().await {
            cnt += 1;
        }
        return;
    });

    tokio::select! {
        rv_a = (&mut send_task) => {
            match rv_a {
                Ok(_) => println!(""),
                Err(a) => println!("Error sending messages {a:?}")
            }
            recv_task.abort();
        },
        rv_b = (&mut recv_task) => {
            match rv_b {
                Ok(_) => println!(""),
                Err(b) => println!("Error receiving messages {b:?}")
            }
            send_task.abort();
        }
    }

    println!("Websocket context destroyed");
}

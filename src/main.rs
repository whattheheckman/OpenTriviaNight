pub mod app_state;
pub mod game;

use app_state::{AppState, Game, GameError};
use axum::{
    extract::{
        ws::{WebSocket, WebSocketUpgrade},
        Path, Query, State,
    },
    response::IntoResponse,
    routing::{get, post},
    Router,
};

use std::{net::SocketAddr, sync::{Arc, Mutex}};
use tower_http::trace::{DefaultMakeSpan, TraceLayer};

use axum::extract::ws::Message::Text;

//allows to split the websocket stream into separate TX and RX branches
use futures::{sink::SinkExt, stream::StreamExt};

#[tokio::main]
async fn main() {
    let state = AppState::new();

    let app = Router::new()
        .route(
            "/games",
            post({
                // TODO: implement
            }),
        )
        .route(
            "/games/:game_id",
            get({
                // TODO: implement
            }),
        )
        .route("/games/:game_id/ws", get(ws_handler))
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

async fn ws_handler(
    ws: WebSocketUpgrade,
    Path(game_id): Path<String>,
    Query(username): Query<String>,
    State(state): State<AppState>,
) -> Result<(), GameError> {
    tracing::debug!("User {username} connected to game {game_id}");

    ws.on_upgrade(move |socket| handle_socket(socket, state, game_id, username));

    return Ok(());
}

/// Actual websocket statemachine (one will be spawned per connection)
async fn handle_socket(socket: WebSocket, state: AppState, game_id: String, username: String) {
    let game = match state.games.get(&game_id) {
        Some(x) => x,
        None => return,
    };

    let (mut sender, mut receiver) = socket.split();

    let cloned_game_id = game_id.clone();
    let cloned_username = username.clone();

    let mut send_task = tokio::spawn(async move {
        // Register a handler that sends events back to the client
        let locked_game = match game.lock() {
            Ok(x) => x,
            Err(poisoned) => poisoned.into_inner()
        };
        locked_game.subscribe(|e| { sender.send(axum::extract::ws::Message::Text("".to_string()))})
    });

    // This second task will receive messages from client and print them on server console
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Text(str) = msg {
                tracing::debug!(
                    "Received string from {cloned_username} for game {cloned_game_id}: {str}"
                )
            }
        }
    });

    // If any one of the tasks exit, abort the other.
    tokio::select! {
        rv_a = (&mut send_task) => {
            match rv_a {
                Ok(_) => tracing::debug!("Send task for game {game_id} and user {username} ended"),
                Err(_) => tracing::debug!("Send task game {game_id} and user {username} ended in an error state")
            }
            recv_task.abort();
        },
        rv_b = (&mut recv_task) => {
            match rv_b {
                Ok(_) => tracing::debug!("Send task for game {game_id} and user {username} ended"),
                Err(_) => tracing::debug!("Send task game {game_id} and user {username} ended in an error state")
            }
            send_task.abort();
        }
    }

    println!("Websocket for game {game_id} for user {username} destroyed");
}

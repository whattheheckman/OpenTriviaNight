use std::borrow::{Borrow, Cow};

use axum::{body::Body, extract::{ws::{CloseFrame, Message, WebSocket}, Path, State, WebSocketUpgrade}, response::Response};
use futures::{SinkExt, StreamExt};
use tokio::sync::broadcast::error::RecvError;

use crate::{actions, dto::{GameMessage, UpdateGameRequest}, models::{AppState, PlayerRole}};

pub async fn join_game(
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
                    reason: Cow::Borrowed(&e.get_message()),
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
            let request = match msg {
                Message::Ping(_payload) => {
                    tracing::debug!("received ping from {ws_rx_username}");
                    continue;
                }
                Message::Text(text) => {
                    match serde_json::from_str::<UpdateGameRequest>(text.as_str()) {
                        Ok(x) => x,
                        Err(e) => {
                            tracing::warn!("Failed to parse the message from {ws_rx_username} for game {ws_rx_game_id}: {text}: {e}");
                            continue;
                        }
                    }
                }
                Message::Close(close_frame) => {
                    tracing::debug!("close frame received for {ws_rx_username} {close_frame:?}");
                    continue;
                }
                _ => continue,
            };

            let mut game_entry = match ws_rx_games.get_mut(&ws_rx_game_id.to_ascii_uppercase()) {
                Some(x) => x,
                None => return,
            };

            actions::handle_game_request(
                &mut game_entry,
                ws_rx_username.clone(),
                role.clone(),
                request,
            );
        }
        return;
    });

    tokio::select! {
        _ = (&mut ws_tx_task) => ws_rx_task.abort(),
        _ = (&mut ws_rx_task) => ws_tx_task.abort(),
    }

    tracing::info!("Websocket closed for {username} in game {game_id}");
}

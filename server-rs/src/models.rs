use std::sync::Arc;

use axum::{http::StatusCode, response::IntoResponse, Json};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};

use crate::dto::GameMessage;

#[derive(Clone)]
pub struct AppState {
    pub games: Arc<DashMap<String, GameEntry>>,
}

pub struct GameEntry {
    pub game: Game,
    pub sender: tokio::sync::broadcast::Sender<GameMessage>,
    pub receiver: tokio::sync::broadcast::Receiver<GameMessage>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub id: String,
    pub players: Vec<Player>,
    pub last_winner: String,
    pub rounds: Vec<Vec<Category>>,
    pub current_round: usize,
    pub state: GameState,
}

impl IntoResponse for Game {
    fn into_response(self) -> axum::response::Response {
        return (StatusCode::OK, Json(self)).into_response();
    }
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Player {
    pub username: String,
    pub score: usize,
    pub role: PlayerRole,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub category_id: String,
    pub name: String,
    pub questions: Vec<Question>,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub question_id: String,
    pub detail: String,
    pub correct_answer: String,
    pub value: usize,
    pub answered: bool,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
pub enum PlayerRole {
    Host,
    Contestant,
    Spectator,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GameState {
    WaitingToStart,
    PickAQuestion,
    ReadQuestion { question: Question },
    WaitingForAnswer { question: Question },
    CheckAnswer { question: Question, player: Player },
    Finished,
}

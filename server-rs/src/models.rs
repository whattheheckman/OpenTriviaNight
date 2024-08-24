use std::sync::Arc;

use axum::{http::StatusCode, response::IntoResponse, Json};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use tokio::time::Instant;

use crate::dto::GameMessage;

#[derive(Clone)]
pub struct AppState {
    pub games: Arc<DashMap<String, GameEntry>>,
}

pub struct GameEntry {
    pub game: Game,
    pub last_updated: Instant,
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
    pub log: Vec<GameLog>,
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
    pub score: isize,
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
    pub value: isize,
    pub answered: bool,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
pub enum PlayerRole {
    Host,
    Contestant,
    Spectator,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
#[serde(tag = "state")]
pub enum GameState {
    WaitingToStart,
    PickAQuestion,
    #[serde(rename_all = "camelCase")]
    ReadQuestion {
        question: Question,
    },
    #[serde(rename_all = "camelCase")]
    WaitingForAnswer {
        question: Question,
    },
    #[serde(rename_all = "camelCase")]
    CheckAnswer {
        question: Question,
        player: Player,
    },
    Finished,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Debug)]
#[serde(tag = "type")]
pub enum GameLog {
    GameCreated {
        time: u128,
    },
    GameStarted {
        time: u128,
    },
    #[serde(rename_all = "camelCase")]
    QuestionPicked {
        time: u128,
        question_id: String,
    },
    PlayerBuzzedIn {
        time: u128,
        username: String,
    },
    #[serde(rename_all = "camelCase")]
    AnswerConfirmed {
        time: u128,
        username: String,
        is_correct: bool,
        points_change: isize,
    },
    QuestionPassed {
        time: u128,
    },
}

use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

use crate::{
    actions::GameError,
    models::{Category, Game, GameLog, GameState, Player, Question},
    util::get_time,
};

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum GameMessage {
    JoinGame {
        game: GameOverview,
    },
    GameUpdate {
        game: GameOverview,
    },
    QuestionUpdate {
        question: Question,
    },
    ReportError {
        error: GameError,
        message: &'static str,
        username: String,
    },
    EndSession {
        username: String,
    },
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GameOverview {
    pub players: Vec<Player>,
    pub last_winner: String,
    pub current_round: usize,
    pub state: GameState,
    pub last_log_index: usize,
    pub last_log: Option<GameLog>,
}

impl Into<GameOverview> for &Game {
    fn into(self) -> GameOverview {
        GameOverview {
            players: self.players.clone(),
            last_winner: self.last_winner.clone(),
            current_round: self.current_round.clone(),
            state: self.state.clone(),
            last_log_index: self.log.len().saturating_sub(1),
            last_log: self.log.last().cloned(),
        }
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum UpdateGameRequest {
    StartGame,
    LeaveGame,
    #[serde(rename_all = "camelCase")]
    PickQuestion {
        question_id: String,
    },
    AllowAnswering,
    AnswerQuestion,
    #[serde(rename_all = "camelCase")]
    ConfirmAnswer {
        is_correct: bool,
    },
    EndQuestion,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateGameRequest {
    pub rounds: Vec<Vec<Category>>,
}

impl Into<Game> for CreateGameRequest {
    fn into(self) -> Game {
        Game {
            id: "".to_string(),
            current_round: 0,
            last_winner: "".to_string(),
            players: Vec::new(),
            rounds: self.rounds,
            state: GameState::WaitingToStart,
            log: vec![GameLog::GameCreated { time: get_time() }],
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GameErrorResponse {
    error: GameError,
    message: &'static str,
}

impl GameError {
    pub fn get_message(&self) -> &'static str {
        return match self {
            GameError::GameNotFound => "Game could not be found.",
            GameError::UsernameTooLong => "Usernames must be less than 20 characters long.",
            GameError::InsufficientPermissions => {
                "User has insufficient permissions to perform this action."
            }
            GameError::InvalidGameState => "Game is not in a valid state.",
            GameError::FailedToCreateGame => "Failed to create the game.",
            GameError::QuestionNotFound => "Could not find the question to pick.",
            GameError::PlayerNotFound => {
                "Player performing the action could not be found in the Game."
            }
            GameError::MissingQuestions => {
                "Game must contain at least 1 round, where all rounds contain at least 1 category, with at least 1 question"
            },
            GameError::NewPlayerCannotJoinAfterStart => "New Contestants cannot join a game after it has started."
        };
    }
}

impl IntoResponse for GameError {
    fn into_response(self) -> axum::response::Response {
        let res = GameErrorResponse {
            message: self.get_message(),
            error: self,
        };
        return (StatusCode::BAD_REQUEST, Json(res)).into_response();
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct StatsResponse {
    pub games_count: usize,
    pub version: &'static str,
}

impl IntoResponse for StatsResponse {
    fn into_response(self) -> axum::response::Response {
        return (StatusCode::OK, Json(self)).into_response();
    }
}

use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

use crate::{
    actions::GameError,
    models::{Category, Game, GameState, Player, Question},
};

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum GameMessage {
    JoinGame { game: GameOverview },
    GameUpdate { game: GameOverview },
    QuestionUpdate { question: Question },
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GameOverview {
    pub players: Vec<Player>,
    pub last_winner: String,
    pub current_round: usize,
    pub state: GameState,
}

impl Into<GameOverview> for &Game {
    fn into(self) -> GameOverview {
        GameOverview {
            players: self.players.clone(),
            last_winner: self.last_winner.clone(),
            current_round: self.current_round.clone(),
            state: self.state.clone(),
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
        }
    }
}

#[derive(Debug, Serialize)]
pub struct GameErrorResponse {
    error: GameError,
    message: &'static str,
}

impl IntoResponse for GameError {
    fn into_response(self) -> axum::response::Response {
        let message = match self {
            GameError::GameNotFound => "Game could not be found",
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
            }
        };
        let res = GameErrorResponse {
            error: self,
            message,
        };
        return (StatusCode::BAD_REQUEST, Json(res)).into_response();
    }
}

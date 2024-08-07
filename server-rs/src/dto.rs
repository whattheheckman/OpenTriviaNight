use serde::{Deserialize, Serialize};

use crate::models::{Category, Game, GameState, Player, Question};

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum GameMessage {
    JoinGame { game: Game },
    GameUpdate { game: UpdateGameResponse },
    QuestionUpdate { question: Question },
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGameResponse {
    pub players: Vec<Player>,
    pub last_winner: String,
    pub current_round: usize,
    pub state: GameState,
}

impl Into<UpdateGameResponse> for Game {
    fn into(self) -> UpdateGameResponse {
        UpdateGameResponse {
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
    PickQuestion { question_id: String },
    AllowAnswering,
    AnswerQuestion,
    #[serde(rename_all = "camelCase")]
    ConfirmAnswer { is_correct: bool },
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

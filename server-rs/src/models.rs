use std::sync::Arc;

use dashmap::DashMap;
use serde::{Deserialize, Serialize};

#[derive(Clone)]
pub struct AppState {
    pub games: Arc<DashMap<String, GameEntry>>
}

pub struct GameEntry {
    pub game: Game,
    pub sender: tokio::sync::broadcast::Sender<GameUpdate>,
    pub receiver: tokio::sync::broadcast::Receiver<GameUpdate>,

}

#[derive(Serialize, Deserialize)]
pub struct Game {
    pub id: String,
    pub players: Vec<Player>,
    pub last_winner: String,
    pub rounds: Vec<Vec<Category>>,
    pub current_round: usize,
    pub state: GameState,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Player {
    pub username: String,
    pub score: usize,
    pub role: PlayerRole,
}

#[derive(Serialize, Deserialize)]
pub struct Category {
    pub category_id: String,
    pub name: String,
    pub questions: Vec<Question>
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Question {
    pub question_id: String,
    pub detail: String,
    pub correct_answer: String,
    pub value: String,
    pub answered: bool
}

#[derive(Clone, Serialize, Deserialize)]
pub enum PlayerRole {
    Host,
    Contestant,
    Spectator,
}

#[derive(Clone, Serialize, Deserialize, PartialEq)]
pub enum GameState {
    WaitingToStart,
    PickAQuestion,
    ReadQuestion(Question),
    WaitingForAnswer(Question),
    CheckAnswer(Question, Player),
    Finished
}

#[derive(Clone, Serialize, Deserialize)]
pub struct GameUpdate {
    pub players: Vec<Player>,
    pub last_winner: String,
    pub current_round: usize,
    pub state: GameState,
}

impl Into<GameUpdate> for Game {
    fn into(self) -> GameUpdate {
        GameUpdate {
            players: self.players.clone(),
            last_winner: self.last_winner.clone(),
            current_round: self.current_round.clone(),
            state: self.state.clone()
        }
    }
}

use std::{collections::HashMap, sync::{Arc, Mutex}};

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct AppState {
    pub games: HashMap<String, Arc<Mutex<Game>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self { games: HashMap::new() }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum GameError {
    InvalidState,
    GameNotFound,
    QuestionNotFound,
    PlayerNotFound,
    UnexpectedError(&'static str),
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Game {
    pub id: String,
    pub players: Vec<Player>,
    pub last_winner: String,
    pub rounds: Vec<HashMap<String, Question>>,
    pub round: usize,
    pub state: GameState,
    #[serde(skip)] pub subscribers: fn(Event),
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Player {
    pub username: String,
    pub points: i32,
    pub role: PlayerRole
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum PlayerRole {
    Host,
    Contestant,
    Observer
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Question {
    pub question: String,
    pub points: i32,
    pub answered: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum GameState {
    /// Waiting for the game to start. This state is the default entry, and can never be re-entered
    WaitingToStart,

    /// Waiting for a Question to be picked. State can be entered from `AnswerQuestion` or `WaitingToStart`.
    PickQuestion,

    /// A question has to be picked, but the quizmaster needs to read it out first. State can be entered from `PickQuestion`.
    ReadQuestion(Question),

    /// Once the question has been read, players are allowed to "buzz" in an answer. State can be entered from `ReadQuestion` or `CheckAnswer`.
    WaitingForAnswer(Question),

    /// A player has buzzed in an answer, and the quizmaster must check it. State can be entered from `WaitingForAnswer`
    CheckAnswer(Question, String),

    /// There are no more questions left, so the game is finished. State can be entered from `CheckAnswer`.
    Finished,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Event {
    GameStateChanged(GameState),
    GameDataChanged(Game),
}

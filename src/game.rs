use crate::app_state::{Event, Game, GameError, GameState, Player, Question};

impl Game {
    /// Subscribe to events representing changes to the `Game`
    pub fn subscribe<F>(&mut self, handler: F) where F: Fn(Event) -> () {
        self.subscribers.push(handler);
    }

    pub fn publish(self, event: Event) {
        for func in self.subscribers.as_slice() {
            func(event.clone());
        }
    }

    /// Start a game that is in the [`GameState::WaitingToStart`] state.
    pub fn start_game(&mut self) -> Result<(), GameError> {
        match self.state {
            GameState::WaitingToStart => {
                self.state = GameState::PickQuestion;
                return Ok(());
            }
            _ => return Err(GameError::InvalidState),
        }
    }

    /// Pick a question from the board.
    /// If the question is found, the game will be transitioned to the [`GameState::ReadQuestion`] state.
    pub fn pick_question(&mut self, question_id: String) -> Result<Question, GameError> {
        let round = match self.rounds.get(self.round) {
            Some(x) => x,
            None => return Err(GameError::UnexpectedError("Round Number not found")),
        };

        let question = match round.get(&question_id) {
            Some(x) => x,
            None => return Err(GameError::QuestionNotFound),
        };

        match self.state {
            GameState::PickQuestion => {
                self.state = GameState::ReadQuestion(question.clone());
                return Ok(question.clone());
            }
            _ => return Err(GameError::InvalidState),
        }
    }

    /// Once the question has been read, move to [`GameState::WaitingForAnswer`] to allow answers to be accepted
    pub fn finish_reading_question(&mut self) -> Result<(), GameError> {
        match &self.state {
            GameState::ReadQuestion(q) => {
                self.state = GameState::WaitingForAnswer(q.clone());
                return Ok(());
            }
            _ => return Err(GameError::InvalidState),
        }
    }

    pub fn attempt_to_answer_question(&mut self, username: String) -> Result<(), GameError> {
        let player = match self.find_player(username) {
            Some(x) => x,
            None => return Err(GameError::PlayerNotFound),
        };

        match &self.state {
            GameState::WaitingForAnswer(q) => {
                self.state = GameState::CheckAnswer(q.clone(), player.username.clone()).into();
                return Ok(());
            }
            _ => return Err(GameError::InvalidState),
        }
    }

    fn find_player(&self, username: String) -> Option<Player> {
        self.players
            .iter()
            .find(|x| x.username == username)
            .cloned()
    }
}

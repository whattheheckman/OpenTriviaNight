use crate::app_state::{Event, Game, GameState, Question};

#[derive(Clone, Debug)]
pub enum GameError {
    InvalidState,
    QuestionNotFound,
    UnexpectedError(&'static str),
}

impl Game {
    /// Subscribe to events representing changes to the `Game`
    pub fn subscribe(&mut self, handler: fn(Event)) {
        self.subscribers.push(handler);
    }

    fn publish(self, event: Event) {
        for func in self.subscribers.as_slice() {
            func(event.clone());
        }
    }

    pub fn start_game(&mut self) -> Result<(), GameError> {
        return self.try_state_transition(GameState::WaitingToStart);
    }

    pub fn pick_question(&mut self, question_id: String) -> Result<Question, GameError> {
        let round = match self.rounds.get(self.round) {
            Some(x) => x,
            None => return Err(GameError::UnexpectedError("Round Number not found")),
        };

        let question = match round.get(&question_id) {
            Some(x) => x,
            None => return Err(GameError::QuestionNotFound),
        }
        .clone();

        match self.try_state_transition(GameState::ReadQuestion(question.clone())) {
            Ok(_) => return Ok(question.clone()),
            Err(err) => return Err(err),
        }
    }

    fn try_state_transition(&mut self, new_state: GameState) -> Result<(), GameError> {
        match new_state {
            // Never allowed to re-enter the WaitingToStart state
            GameState::WaitingToStart => return Err(GameError::InvalidState),

            GameState::PickQuestion => match self.state {
                GameState::WaitingToStart | GameState::CheckAnswer(_) => {
                    self.state = new_state;
                    return Ok(());
                }
                _ => return Err(GameError::InvalidState),
            },

            GameState::ReadQuestion(_) => match self.state {
                GameState::PickQuestion => {
                    self.state = new_state;
                    return Ok(());
                }
                _ => return Err(GameError::InvalidState),
            },

            GameState::WaitingForAnswer(_) => match self.state {
                GameState::ReadQuestion(_) | GameState::CheckAnswer(_) => {
                    self.state = new_state;
                    return Ok(());
                }
                _ => return Err(GameError::InvalidState),
            },

            GameState::CheckAnswer(_) => match self.state {
                GameState::WaitingForAnswer(_) => {
                    self.state = new_state;
                    return Ok(());
                }
                _ => return Err(GameError::InvalidState),
            },

            GameState::Finished => match self.state {
                GameState::CheckAnswer(_) => {
                    self.state = new_state;
                    return Ok(());
                }
                _ => return Err(GameError::InvalidState),
            },
        }
    }
}

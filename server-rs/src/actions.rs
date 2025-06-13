use std::borrow::Borrow;

use crate::{
    dto::{CreateGameRequest, GameMessage, GameOverview, UpdateGameRequest},
    models::{AppState, Game, GameEntry, GameLog, GameState, Player, PlayerRole, Question},
    util::get_time,
};
use dashmap::mapref::one::RefMut;
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use tokio::{sync::broadcast, time::Instant};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum GameError {
    InsufficientPermissions,
    InvalidGameState,
    FailedToCreateGame,
    GameNotFound,
    UsernameTooLong,
    QuestionNotFound,
    PlayerNotFound,
    MissingQuestions,
    NewPlayerCannotJoinAfterStart,
    AlreadyAnswered,
}

impl AppState {
    pub fn create_game(self, request: CreateGameRequest) -> Result<Game, GameError> {
        if request.rounds.is_empty()
            || request.rounds.iter().any(|x| x.is_empty())
            || request
                .rounds
                .iter()
                .flat_map(|x| x)
                .any(|x| x.questions.is_empty())
            || request
                .rounds
                .iter()
                .flat_map(|x| x)
                .flat_map(|x| x.questions.iter())
                .any(|x| x.correct_answer.is_empty() || x.detail.is_empty())
        {
            return Err(GameError::MissingQuestions);
        }
        // Chars A-Z in ASCII
        let id_chars: Vec<char> = (65..90u32).map(|x| char::from_u32(x).unwrap()).collect();
        let mut rng = rand::thread_rng();
        let id: String = (0..4)
            .map(|_x| id_chars.choose(&mut rng).unwrap_or(&'A'))
            .collect::<String>();

        let mut game: Game = request.into();
        game.id = id.clone();
        let (sender, receiver) = broadcast::channel(16);
        let game_entry = GameEntry {
            game: game.clone(),
            sender,
            receiver,
            last_updated: Instant::now(),
        };
        match self.games.insert(id, game_entry) {
            Some(_) => return Err(GameError::FailedToCreateGame), // Game already exists, might be an ID clash. So fail.
            None => return Ok(game),
        }
    }

    pub fn join_game(
        self,
        game_id: String,
        username: String,
        role: PlayerRole,
    ) -> Result<(), GameError> {
        if game_id.len() > 4 {
            return Err(GameError::GameNotFound);
        }

        if username.len() > 20 {
            return Err(GameError::UsernameTooLong);
        }

        let mut entry = match self.games.get_mut(&game_id.to_ascii_uppercase()) {
            Some(x) => x,
            None => return Err(GameError::GameNotFound),
        };

        let existing = get_player(&mut entry.game, username.clone());
        if let Some(_player) = existing {
            // If the player already exists, then don't add them again.
            return Ok(());
        }

        if role != PlayerRole::Spectator && entry.game.state != GameState::WaitingToStart {
            return Err(GameError::NewPlayerCannotJoinAfterStart);
        }

        let game_entry = entry.value_mut();
        let new_player = Player {
            username,
            role,
            score: 0,
        };
        game_entry.game.players.push(new_player);
        game_entry.last_updated = Instant::now();

        let _ = game_entry.sender.send(GameMessage::GameUpdate {
            game: game_entry.game.borrow().into(),
        });

        return Ok(());
    }
}

pub fn handle_game_request(
    game_entry: &mut RefMut<String, GameEntry>,
    username: String,
    request: UpdateGameRequest,
) -> () {
    game_entry.last_updated = Instant::now();
    let current_player = get_player(&mut game_entry.game, username.clone());
    let role = match current_player {
        Some(player) => player.role.clone(),
        None => PlayerRole::Contestant,
    };

    let result = match request {
        UpdateGameRequest::StartGame => start_game(game_entry, role),
        UpdateGameRequest::LeaveGame => leave_game(game_entry, username.clone()),
        UpdateGameRequest::PickQuestion { question_id } => pick_question(game_entry, question_id),
        UpdateGameRequest::AllowAnswering => allow_answering(game_entry, role),
        UpdateGameRequest::AnswerQuestion => answer_question(game_entry, username.clone()),
        UpdateGameRequest::ConfirmAnswer { is_correct } => confirm_answer(game_entry, is_correct),
        UpdateGameRequest::EndQuestion => end_question(game_entry, role),
    };

    match result {
        Ok(_) => {
            let update: GameOverview = game_entry.game.borrow().into();
            let _ = game_entry
                .sender
                .send(GameMessage::GameUpdate { game: update });
        }
        Err(e) => {
            tracing::error!("Failed to process the game request: {e:?}");
            let _ = game_entry.sender.send(GameMessage::ReportError {
                message: e.get_message(),
                error: e,
                username,
            });
        }
    }
}

fn start_game(
    game_entry: &mut RefMut<String, GameEntry>,
    role: PlayerRole,
) -> Result<(), GameError> {
    if role != PlayerRole::Host {
        return Err(GameError::InsufficientPermissions);
    }

    if game_entry.game.state != GameState::WaitingToStart {
        return Err(GameError::InvalidGameState);
    }

    game_entry.game.state = GameState::PickAQuestion;
    game_entry
        .game
        .log
        .push(GameLog::GameStarted { time: get_time() });
    return Ok(());
}

fn leave_game(
    game_entry: &mut RefMut<String, GameEntry>,
    username: String,
) -> Result<(), GameError> {
    // Send a message to the websocket to tell it to cleanly close the session for the specified user
    let _ = game_entry.sender.send(GameMessage::EndSession {
        username: username.clone(),
    });

    if game_entry.game.state == GameState::WaitingToStart {
        let player_index = game_entry
            .game
            .players
            .iter()
            .position(|x| x.username == username);

        if let Some(index) = player_index {
            game_entry.game.players.remove(index);
        }
    }
    return Ok(());
}

fn pick_question(
    game_entry: &mut RefMut<String, GameEntry>,
    question_id: String,
) -> Result<(), GameError> {
    if game_entry.game.state != GameState::PickAQuestion {
        return Err(GameError::InvalidGameState);
    }

    let game = &mut game_entry.value_mut().game;

    let question = game.rounds[game.current_round]
        .iter()
        .flat_map(|x| x.questions.iter())
        .find(|x| x.question_id == question_id && x.answered == false);

    if let Some(question) = question {
        game.state = GameState::ReadQuestion {
            question: question.clone(),
        };
        game.log.push(GameLog::QuestionPicked {
            time: get_time(),
            question_id: question.clone().question_id,
        });
    } else {
        return Err(GameError::QuestionNotFound);
    }

    return Ok(());
}

fn allow_answering(
    game_entry: &mut RefMut<String, GameEntry>,
    role: PlayerRole,
) -> Result<(), GameError> {
    if role != PlayerRole::Host {
        return Err(GameError::InsufficientPermissions);
    }

    if let GameState::ReadQuestion { question } = &game_entry.game.state {
        game_entry.game.state = GameState::WaitingForAnswer {
            question: question.clone(),
        };
    } else {
        return Err(GameError::InvalidGameState);
    }

    return Ok(());
}

fn answer_question(
    game_entry: &mut RefMut<String, GameEntry>,
    username: String,
) -> Result<(), GameError> {
    let game = &mut game_entry.value_mut().game;
    match game.state.clone() {
        GameState::WaitingForAnswer { question } => {
            let player = match game.players.iter().find(|x| x.username == username) {
                Some(x) => x,
                None => return Err(GameError::PlayerNotFound),
            };

            game.state = GameState::CheckAnswer {
                question: question.clone(),
                player: player.clone(),
            };

            game.log.push(GameLog::PlayerBuzzedIn {
                time: get_time(),
                username: username.clone(),
            });
        }
        GameState::CheckAnswer {
            question: _,
            player: _,
        } => {
            return Err(GameError::AlreadyAnswered);
        }
        _ => return Err(GameError::InvalidGameState),
    }

    return Ok(());
}

fn confirm_answer(
    game_entry: &mut RefMut<String, GameEntry>,
    is_correct: bool,
) -> Result<(), GameError> {
    let state = game_entry.game.state.clone();
    if let GameState::CheckAnswer { question, player } = state {
        let player_to_update = match get_player(&mut game_entry.game, player.username) {
            Some(x) => x,
            None => return Err(GameError::PlayerNotFound),
        };
        let username = player_to_update.username.clone();

        if is_correct {
            player_to_update.score += question.value;
            game_entry.game.last_winner = username.clone();
            mark_question_answered(game_entry, question.question_id.clone())?;
        } else {
            player_to_update.score -= question.value;
            game_entry.game.state = GameState::WaitingForAnswer {
                question: question.clone(),
            };
        }

        game_entry.game.log.push(GameLog::AnswerConfirmed {
            time: get_time(),
            username,
            is_correct,
            points_change: question.value,
            question_id: question.question_id,
        });
    } else {
        return Err(GameError::InvalidGameState);
    }

    return Ok(());
}

fn end_question(
    game_entry: &mut RefMut<String, GameEntry>,
    role: PlayerRole,
) -> Result<(), GameError> {
    if role != PlayerRole::Host {
        return Err(GameError::InsufficientPermissions);
    }

    if let GameState::WaitingForAnswer { question } = game_entry.game.state.clone() {
        if let Err(e) = mark_question_answered(game_entry, question.question_id.clone()) {
            return Err(e);
        }
        game_entry.game.log.push(GameLog::QuestionPassed {
            time: get_time(),
            question_id: question.question_id,
        });
    } else {
        return Err(GameError::InvalidGameState);
    }

    return Ok(());
}

fn get_player(game: &mut Game, username: String) -> Option<&mut Player> {
    return game.players.iter_mut().find(|x| x.username == username);
}

fn get_question(game: &mut Game, question_id: String) -> Option<&mut Question> {
    return game
        .rounds
        .iter_mut()
        .flat_map(|x| x.iter_mut())
        .flat_map(|x| x.questions.iter_mut())
        .find(|x| x.question_id == question_id);
}

fn mark_question_answered(
    game_entry: &mut GameEntry,
    question_id: String,
) -> Result<(), GameError> {
    let question = match get_question(&mut game_entry.game, question_id) {
        Some(x) => x,
        None => return Err(GameError::QuestionNotFound),
    };
    question.answered = true;

    // Inform all clients that this question has been answered
    let _ = game_entry.sender.send(GameMessage::QuestionUpdate {
        question: question.clone(),
    });

    let game = &mut game_entry.game;
    game.state = GameState::PickAQuestion;

    // If all questions are answered, then end the game
    if game
        .rounds
        .iter()
        .flat_map(|x| x)
        .flat_map(|x| x.questions.iter())
        .all(|x| x.answered)
    {
        game.state = GameState::Finished;
        return Ok(());
    }

    // If all questions inside this round are answered, then go to the next round
    if game.rounds[game.current_round]
        .iter()
        .flat_map(|x| x.questions.iter())
        .all(|x| x.answered)
    {
        game.current_round += 1;
    }

    return Ok(());
}

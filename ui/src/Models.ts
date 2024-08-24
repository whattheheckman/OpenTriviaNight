export type Game = {
  id: string;
  players: [Player];
  lastWinner: string | undefined;
  rounds: Category[][];
  currentRound: number;
  state: GameState;
  log: GameLog[];
};

export type Player = {
  username: string;
  score: number;
  role: PlayerRole;
};

export type PlayerRole = "Host" | "Contestant" | "Spectator";

export type Category = {
  categoryId: string;
  name: string;
  questions: Question[];
};

export type Question = {
  questionId: string;
  detail: string;
  correctAnswer: string;
  value: number;
  answered: boolean;
};

export type GameState = GSWaitingToStart | GSPickAQuestion | GSReadQuestion | GSWaitingForAnswer | GSCheckAnswer | GSFinished;

export type GSWaitingToStart = {
  state: "WaitingToStart";
};

export type GSPickAQuestion = {
  state: "PickAQuestion";
};

export type GSReadQuestion = {
  state: "ReadQuestion";
  question: Question;
};

export type GSWaitingForAnswer = {
  state: "WaitingForAnswer";
  question: Question;
};

export type GSCheckAnswer = {
  state: "CheckAnswer";
  question: Question;
  player: Player;
};

export type GSFinished = {
  state: "Finished";
};

export type CreateGameRequest = {
  rounds: Category[][];
};

export type GameMessage =
  | { type: "JoinGame"; game: Game }
  | { type: "GameUpdate"; game: GameOverview }
  | { type: "QuestionUpdate"; question: Question }
  | { type: "ReportError"; error: string; message: string };

export type Stats = {
  gamesCount: number;
  version: string;
};

export type GameLog =
  | { type: "GameCreated"; time: number }
  | { type: "GameStarted"; time: number }
  | { type: "QuestionPicked"; time: number; questionId: string }
  | { type: "PlayerBuzzedIn"; time: number; username: string }
  | { type: "AnswerConfirmed"; time: number; username: string; isCorrect: boolean; pointsChange: number }
  | { type: "QuestionPassed"; time: number };

export type GameOverview = {
  players: [Player];
  lastWinner: string | undefined;
  currentRound: number;
  state: GameState;
  lastLogIndex: number;
  lastLog: GameLog | undefined;
};

export type Preferences = {
  hideGameId: boolean;
};

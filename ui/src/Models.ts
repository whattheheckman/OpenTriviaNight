export type Game = {
  id: string;
  players: [Player];
  lastWinner: string | undefined;
  rounds: Category[][];
  currentRound: number;
  state: GameState;
};

export type Player = {
  username: string;
  score: number;
  role: "Host" | "Contestant" | "Spectator";
};

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
  | {
      type: "JoinGame";
      game: Game;
    }
  | {
      type: "GameUpdate";
      game: Game;
    }
  | {
      type: "QuestionUpdate";
      question: Question;
    };

export type Stats = {
  gamesCount: number;
  version: string;
};

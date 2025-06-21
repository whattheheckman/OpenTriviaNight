import { useCallback, useContext, useMemo, useRef } from "react";
import { GameContext } from "./GameContext";
import { CreateGameRequest } from "./Models";

type UpdateGameRequest =
  | {
    type: "StartGame";
  }
  | {
    type: "LeaveGame";
  }
  | {
    type: "PickQuestion";
    questionId: string;
  }
  | {
    type: "AllowAnswering";
  }
  | {
    type: "AnswerQuestion";
  }
  | {
    type: "ConfirmAnswer";
    isCorrect: boolean;
  }
  | {
    type: "EndQuestion";
  }
  | {
    type: "UpdatePlayerScore";
    updateUsername: string;
    newScore: number;
  };

export default function useApiClient() {
  const { addError, sendWsMessage } = useContext(GameContext);

  const handleError = useCallback(
    (e: unknown) => {
      let message = "Unknown Error";
      if (typeof e === "string") {
        message = e;
      } else if (e instanceof Error) {
        message = e.message;
      }

      addError(message);
      console.error("Handled Error: ", e);
    },
    [addError]
  );

  const execute = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (action: () => Promise<any> | undefined) => {
      return action()
        ?.then((res) => {
          if (Array.isArray(res)) return res;
          if (res.response) return res.response;
          if (res.error) {
            throw Error(res.message);
          }
          return res;
        })
        .catch(handleError);
    },
    [handleError]
  );

  const executeWs = useCallback(
    (req: UpdateGameRequest) => {
      sendWsMessage(JSON.stringify(req));
    },
    [sendWsMessage]
  );

  const apiClient = useRef({
    createGame:
      (request: CreateGameRequest) => {
        return execute(async () => {
          const res = await fetch(`/api/games`, {
            method: "POST",
            body: JSON.stringify(request),
            headers: [["Content-Type", "application/json"]],
          });
          if (res.status >= 500) throw Error(`Error creating game: ${res.status}`);
          return await res.json();
        });
      },
    getGame:
      (gameId: string) => {
        return execute(async () => {
          const res = await fetch(`/api/games/${gameId}`);
          if (res.status >= 500) throw Error(`Game could not be found`);
          return await res.json();
        });
      },
    leaveGame: () => {
      return executeWs({ type: "LeaveGame" });
    },
    startGame: () => {
      return executeWs({ type: "StartGame" });
    },
    pickQuestion:
      (questionId: string) => {
        return executeWs({ type: "PickQuestion", questionId: questionId });
      },
    answerQuestion: () => {
      return executeWs({ type: "AnswerQuestion" });
    },
    allowAnswering: () => {
      return executeWs({ type: "AllowAnswering" });
    },
    confirmAnswer:
      (isCorrect: boolean) => {
        return executeWs({ type: "ConfirmAnswer", isCorrect: isCorrect });
      },
    endQuestion: () => {
      return executeWs({ type: "EndQuestion" });
    },
    updatePlayerScore:
      (updateUsername: string, newScore: number) => {
        return executeWs({ type: "UpdatePlayerScore", updateUsername: updateUsername, newScore: newScore });
      },

    getQuestionsFromOpenTDB:
      ({ category, difficulty }: { category: number; difficulty: string }) => {
        return execute(async () => {
          const res = await fetch(
            `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple&encode=url3986`
          );
          if (res.status === 429) throw Error("Question generation requests are throttled. Please wait a few seconds and try again.");
          if (res.status >= 400) throw Error(`Open TDB returned an error: ${res.status}`);
          return await res.json();
        });
      },
    getQuestionsFromTriviaApi:
      (category: string, difficulty: string) => {
        return execute(async () => {
          const res = await fetch(
            `https://the-trivia-api.com/v2/questions?limit=5&categories=${category}&difficulties=${difficulty}&types=text_choice`
          );
          if (res.status === 429) throw Error("Question generation requests are throttled. Please wait a few seconds and try again.");
          if (res.status >= 400) throw Error(`Trivia API returned an error: ${res.status}`);
          return await res.json();
        });
      },
    getStats: () => {
      return execute(async () => {
        const res = await fetch(`/api/stats`);
        if (res.status >= 500) throw Error(`Error fetching stats`);
        return await res.json();
      });
    },
  });

  return apiClient.current;
}

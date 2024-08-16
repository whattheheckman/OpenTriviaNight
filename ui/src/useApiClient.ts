import { useCallback, useContext } from "react";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: UpdateGameRequest) => {
      sendWsMessage(JSON.stringify(req));
    },
    [sendWsMessage]
  );

  return {
    createGame: useCallback(
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
      [execute]
    ),
    getGame: useCallback(
      (gameId: string) => {
        return execute(async () => {
          const res = await fetch(`/api/games/${gameId}`);
          if (res.status >= 500) throw Error(`Game could not be found`);
          return await res.json();
        });
      },
      [execute]
    ),
    leaveGame: useCallback(() => {
      return executeWs({ type: "LeaveGame" });
    }, [executeWs]),
    startGame: useCallback(() => {
      return executeWs({ type: "StartGame" });
    }, [executeWs]),
    pickQuestion: useCallback(
      (questionId: string) => {
        return executeWs({ type: "PickQuestion", questionId: questionId });
      },
      [executeWs]
    ),
    answerQuestion: useCallback(() => {
      return executeWs({ type: "AnswerQuestion" });
    }, [executeWs]),
    allowAnswering: useCallback(() => {
      return executeWs({ type: "AllowAnswering" });
    }, [executeWs]),
    confirmAnswer: useCallback(
      (isCorrect: boolean) => {
        return executeWs({ type: "ConfirmAnswer", isCorrect: isCorrect });
      },
      [executeWs]
    ),
    endQuestion: useCallback(() => {
      return executeWs({ type: "EndQuestion" });
    }, [executeWs]),

    getQuestionsFromOpenTDB: useCallback(
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
      [execute]
    ),
    getQuestionsFromTriviaApi: useCallback(
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
      [execute]
    ),
    getStats: useCallback(() => {
      return execute(async () => {
        const res = await fetch(`/api/stats`);
        if (res.status >= 500) throw Error(`Error fetching stats`);
        return await res.json();
      });
    }, [execute]),
  };
}

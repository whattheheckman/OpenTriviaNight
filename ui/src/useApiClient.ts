import { useCallback, useContext } from "react";
import { GameContext } from "./GameContext";
import { CreateGameRequest } from "./Models";

export default function useApiClient() {
  const { signalR, addError } = useContext(GameContext);

  const handleError = (e: unknown) => {
    let message = "Unknown Error"
    if (typeof e === "string") {
      message = e
    } else if (e instanceof Error) {
      message = e.message
    }

    addError(message);
    console.error("Handled Error: ", e)
  }

  const execute = (action: () => Promise<any> | undefined) => {
    return action()
      ?.then(res => {
        if (Array.isArray(res)) return res;
        if (res.response) return res.response;
        if (res.error) {
          throw Error(res.error.message);
        }
        return res;
      }).catch(handleError)
  }

  return {
    createGame: useCallback(
      (request: CreateGameRequest) => {
        return execute(() => signalR.invoke("CreateGame", request))
      },
      [execute]
    ),
    joinGame: useCallback(
      (gameId: string, username: string, role: "Host" | "Contestant" | "Spectator") => {
        return execute(() => signalR.invoke("JoinGame", gameId, username, role))
      },
      [execute]
    ),
    leaveGame: useCallback(
      () => {
        return execute(() => signalR.invoke("LeaveGame"))
      },
      [execute]
    ),
    startGame: useCallback(
      () => {
        return execute(() => signalR.invoke("StartGame"))
      },
      [execute]
    ),
    pickQuestion: useCallback(
      (questionId: string) => {
        return execute(() => signalR.invoke("PickQuestion", questionId))
      },
      [execute]
    ),
    answerQuestion: useCallback(
      () => {
        return execute(() => signalR.invoke("AnswerQuestion"))
      },
      [execute]
    ),
    allowAnswering: useCallback(
      () => {
        return execute(() => signalR.invoke("AllowAnswering"))
      },
      [execute]
    ),
    confirmAnswer: useCallback(
      (isCorrect: boolean) => {
        return execute(() => signalR.invoke("ConfirmAnswer", isCorrect))
      },
      [execute]
    ),
    endQuestion: useCallback(
      () => {
        return execute(() => signalR.invoke("EndQuestion"))
      },
      [execute]
    ),

    getQuestionsFromOpenTDB: useCallback(
      ({ category, difficulty }: { category: number, difficulty: string }) => {
        return execute(async () => {
          const res = await fetch(`https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple&encode=url3986`);
          if (res.status === 429) throw Error("Question generation requests are throttled. Please wait a few seconds and try again.")
          if (res.status >= 400) throw Error(`Open TDB returned an error: ${res.status}`)
          return await res.json();
        })
      },
      [execute]
    ),
    getQuestionsFromTriviaApi: useCallback(
      (category: string, difficulty: string) => {
        return execute(async () => {
          const res = await fetch(`https://the-trivia-api.com/v2/questions?limit=5&categories=${category}&difficulties=${difficulty}&types=text_choice`)
          if (res.status === 429) throw Error("Question generation requests are throttled. Please wait a few seconds and try again.")
          if (res.status >= 400) throw Error(`Trivia API returned an error: ${res.status}`)
          return await res.json()
        })
      },
      [execute]
    )
  }
}
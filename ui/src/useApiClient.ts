import { useCallback, useContext } from "react";
import { GameContext } from "./GameContext";
import { CreateGameRequest } from "./Models";

export default function useApiClient() {
  const { signalR, addError, errors } = useContext(GameContext);

  const handleError = (e: unknown) => {
    let message = "Unknown Error"
    if (typeof e === "string") {
      message = e
    } else if (e instanceof Error) {
      message = e.message
    }

    addError(message);
  }

  const execute = async (action: () => Promise<any> | undefined) => {
    try {
      return await action();
    } catch (e) {
      handleError(e)
      throw e;
    }
  }

  return {
    createGame: useCallback(
      async (request: CreateGameRequest) => {
        return execute(() => signalR.invoke("CreateGame", request))
      },
      [handleError, signalR]
    ),
    joinGame: useCallback(
      async (gameId: string, username: string, role: "Host" | "Contestant" | "Spectator") => {
        return execute(() => signalR.invoke("JoinGame", gameId, username, role))
      },
      [handleError, signalR]
    ),
    startGame: useCallback(
      async () => {
        return execute(() => signalR.invoke("StartGame"))
      },
      [handleError, signalR]
    ),
    pickQuestion: useCallback(
      async (questionId: string) => {
        return execute(() => signalR.invoke("PickQuestion", questionId))
      },
      [handleError, signalR]
    ),
    answerQuestion: useCallback(
      async () => {
        return execute(() => signalR.invoke("AnswerQuestion"))
      },
      [handleError, signalR]
    ),
    allowAnswering: useCallback(
      async () => {
        return execute(() => signalR.invoke("AllowAnswering"))
      },
      [handleError, signalR]
    ),
    confirmAnswer: useCallback(
      async (isCorrect: boolean) => {
        return execute(() => signalR.invoke("ConfirmAnswer", isCorrect))
      },
      [handleError, signalR]
    ),
    endQuestion: useCallback(
      async () => {
        return execute(() => signalR.invoke("EndQuestion"))
      },
      [handleError, signalR]
    ),
  }
}
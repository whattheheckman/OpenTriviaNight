import GameScreen from "./game/GameScreen";
import { useEffect, useState } from "react";
import { Errors, GameContext } from "./GameContext";
import { Game, GameMessage } from "./Models";
import Header from "./layout/Header";
import { Toast } from "flowbite-react";
import CreateJoinGame from "./game/create/CreateJoinGame";
import useWebSocket from "react-use-websocket";
import useSessionStorageState from "use-session-storage-state";

function App() {
  const [game, setGame] = useSessionStorageState<Game | undefined>("game");
  const [username, setUsername] = useSessionStorageState<string>("username", { defaultValue: "" });
  const [role, setRole] = useSessionStorageState<"Host" | "Contestant" | "Spectator" | undefined>("role", { defaultValue: undefined });
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const removeError = (id: string) => {
    setErrors((e) => {
      if (e[id]) {
        delete e[id];
      }
      return { ...e };
    });
  };

  const addError = (error: string) => {
    const id = crypto.randomUUID();
    setErrors((e) => {
      return { ...e, [id]: error };
    });
    // Show the error for 5 seconds, then remove if
    setTimeout(() => {
      removeError(id);
    }, 2500);
  };

  useEffect(() => {
    if (game?.id && role && username) {
      setWsUrl(`/api/stream/games/${game.id}/${role}/${username}`);
    } else {
      setWsUrl(null);
    }
  }, [game, role, username, setWsUrl]);

  const onWsClose = (e: CloseEvent) => {
    console.warn("WebSocket closed", e);
    if (e.code === 1001) {
      // Return immediately, this close will be reconnected
      return;
    } else if (e.code === 3001) {
      // Do nothing, this means the user has requested to leave the game
    } else if (e.code > 3001) {
      // Custom error message returned from the backend
      addError(e.reason);
    } else {
      addError("Connection to server lost for an unknown reason. You can rejoin the game by using the same username.");
    }
    setGame(undefined);
    setRole(undefined);
  };

  const shouldWsReconnect = (e: CloseEvent) => {
    return e.code === 1001;
  };

  const onWsMessage = (e: WebSocketEventMap["message"]) => {
    const message: GameMessage = JSON.parse(e.data);
    switch (message.type) {
      case "JoinGame":
      case "GameUpdate":
        setGame((g) => {
          return { ...g, ...message.game };
        });
        break;
      case "QuestionUpdate":
        setGame((g) => {
          if (!g) {
            return g;
          }
          const categoryIndex = g.rounds[g.currentRound].findIndex((category) =>
            category.questions.find((q) => q.questionId === message.question.questionId)
          );
          const questionIndex = g.rounds[g.currentRound][categoryIndex].questions.findIndex(
            (x) => x.questionId == message.question.questionId
          );
          g.rounds[g.currentRound][categoryIndex].questions[questionIndex] = message.question;
          return { ...g };
        });
    }
  };

  const { sendMessage } = useWebSocket(wsUrl, {
    onOpen: () => console.log("ws opened", wsUrl),
    onClose: onWsClose,
    onMessage: onWsMessage,
    retryOnError: true,
    shouldReconnect: shouldWsReconnect,
    reconnectAttempts: 5,
    reconnectInterval: 100,
    heartbeat: { interval: 20000, message: JSON.stringify({ type: "Ping" }) },
  });

  return (
    <>
      <GameContext.Provider
        value={{
          game: game,
          setGame: setGame,
          username: username,
          setUsername: setUsername,
          role: role,
          setRole: setRole,
          errors: errors,
          addError: addError,
          sendWsMessage: sendMessage,
        }}
      >
        <div className="min-h-svh flex flex-col">
          <Header />
          {game ? <GameScreen /> : <CreateJoinGame />}

          <div className="fixed top-4 right-4 flex flex-col gap-4">
            {Object.entries(errors).map(([id, e]) => {
              return (
                <Toast key={id} className="bg-orange-200" style={{ zIndex: 60 }}>
                  <span>{e}</span>
                  <Toast.Toggle className="bg-orange-200" onDismiss={() => removeError(id)} />
                </Toast>
              );
            })}
          </div>
        </div>
      </GameContext.Provider>
    </>
  );
}

export default App;

import GameScreen from "./game/GameScreen";
import { useEffect, useState } from "react";
import { Errors, GameContext } from "./GameContext";
import { Game, GameMessage } from "./Models";
import Header from "./layout/Header";
import { Toast } from "flowbite-react";
import CreateJoinGame from "./game/create/CreateJoinGame";
import useWebSocket from "react-use-websocket";

function App() {
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"Host" | "Contestant" | "Spectator">("Contestant");
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

  const onWsClose = () => {
    console.warn("WebSocket closed");
    setGame(undefined);
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
    onError: (e) => console.log("ws error", e),
    onClose: onWsClose,
    onMessage: onWsMessage,
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

          <div className="absolute top-4 right-4 flex flex-col gap-4">
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

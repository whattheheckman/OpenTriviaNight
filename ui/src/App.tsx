import { createSignalRContext } from "react-signalr/signalr";
import GameScreen from './game/GameScreen'
import { useState } from "react";
import { Errors, GameContext } from "./GameContext";
import { Game } from "./Models";
import Header from "./layout/Header";
import { Toast } from "flowbite-react";

const SignalRContext = createSignalRContext();

function App() {
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [username, setUsername] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});

  const removeError = (id: string) => {
    setErrors(e => {
      if (e[id]) {
        delete e[id];
      }
      return { ...e }
    })
  }

  const addError = (error: string) => {
    let id = crypto.randomUUID();
    setErrors(e => { return { ...e, [id]: error } })
    // Show the error for 5 seconds, then remove if
    setTimeout(() => {
      removeError(id);
    }, 2500)
  }

  return (
    <>
      <SignalRContext.Provider
        connectEnabled={true}
        url={"/api/stream"}
        onOpen={() => console.log("Signal R connection opened")}
        dependencies={[]}
      >
        <GameContext.Provider value={{ game: game, setGame: setGame, username: username, setUsername: setUsername, signalR: SignalRContext, errors: errors, addError: addError }}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <GameScreen></GameScreen>
            <div className="absolute top-4 right-4 flex flex-col gap-4">
              {Object.entries(errors).map(([id, e]) => {
                return <Toast className="bg-orange-200" style={{ zIndex: 60 }}>
                  <span>{e}</span>
                  <Toast.Toggle className="bg-orange-200" onDismiss={() => removeError(id)} />
                </Toast>
              })}
            </div>
          </div>
        </GameContext.Provider>
      </SignalRContext.Provider >
    </>
  )
}

export default App

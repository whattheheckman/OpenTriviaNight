import { createSignalRContext } from "react-signalr/signalr";
import GameScreen from './game/GameScreen'
import { useState } from "react";
import { GameContext } from "./GameContext";
import { Game } from "./Models";
import Header from "./layout/Header";

const SignalRContext = createSignalRContext();

function App() {
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [username, setUsername] = useState<string>("");

  return (
    <>
      <SignalRContext.Provider
        connectEnabled={true}
        url={"/api/stream"}
        onOpen={() => console.log("Signal R connection opened")}
        dependencies={[]}
      >
        <GameContext.Provider value={{ game: game, setGame: setGame, username: username, setUsername: setUsername, signalR: SignalRContext }}>
          <Header />
          <GameScreen></GameScreen>
        </GameContext.Provider>
      </SignalRContext.Provider >
    </>
  )
}

export default App

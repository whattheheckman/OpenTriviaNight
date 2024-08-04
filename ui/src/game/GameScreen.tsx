import { useContext } from "react";
import { GameContext } from "../GameContext";
import CreateJoinGame from "./create/CreateJoinGame";
import { WaitingToStartScreen } from "./WaitingToStartScreen";
import HostScreen from "./host/HostScreen";
import ContestantScreen from "./contestant/ContestantScreen";

export default function GameScreen() {
  const {game, setGame, username, signalR} = useContext(GameContext);

  signalR.useSignalREffect(
    "game-update",
    (update) => {
      if (game) {
        setGame({ ...game, ...update })
      }
    },
    []
  );

  if (game === undefined) { return <CreateJoinGame /> }

  if (game.state.state === "WaitingToStart") return <WaitingToStartScreen />

  const role = game.players.find(x => x.username === username)?.role ?? "Spectator"

  switch (role) {
    case "Host": return <HostScreen />;
    case "Contestant": return <ContestantScreen />;
  }
}
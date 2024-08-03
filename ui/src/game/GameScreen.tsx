import { useContext } from "react";
import { GameContext } from "../GameContext";
import CreateJoinGame from "./create/CreateGame";
import HostPickAQuestion from "./host/HostPickAQuestion";
import { WaitingToStartScreen } from "./WaitingToStartScreen";

export default function GameScreen() {
  const {game, setGame, signalR} = useContext(GameContext);

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
}
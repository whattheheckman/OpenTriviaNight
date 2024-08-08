import { useContext } from "react";
import { GameContext } from "../GameContext";
import WaitingToStartScreen from "./WaitingToStartScreen";
import HostScreen from "./host/HostScreen";
import ContestantScreen from "./contestant/ContestantScreen";
import GameFinishedScreen from "./GameFinishedScreen";

export default function GameScreen() {
  const { game, username } = useContext(GameContext);

  if (game === undefined) {
    return <></>;
  }

  if (game.state.state === "WaitingToStart") return <WaitingToStartScreen />;
  if (game.state.state === "Finished") return <GameFinishedScreen />;

  const role = game.players.find((x) => x.username === username)?.role ?? "Spectator";

  switch (role) {
    case "Host":
      return <HostScreen />;
    case "Contestant":
      return <ContestantScreen />;
  }
}

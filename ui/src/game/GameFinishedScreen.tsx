import { Button } from "flowbite-react";
import PlayerScoreTable from "./common/PlayerScoreTable";
import { useContext } from "react";
import { GameContext } from "../GameContext";

export default function GameFinishedScreen() {
  const { setGame } = useContext(GameContext);

  return (
    <div className="flex flex-col text-center items-stretch gap-4 my-4 mx-auto">
      <span className="text-xl">Game Finished!</span>
      <PlayerScoreTable />
      <Button onClick={() => setGame(undefined)}>Leave Game</Button>
    </div>
  )
}
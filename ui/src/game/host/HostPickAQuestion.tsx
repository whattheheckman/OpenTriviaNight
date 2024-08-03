import { useContext } from "react";
import { GameContext } from "../../GameContext";

export default function HostPickAQuestion() {
  const { game } = useContext(GameContext);

  if (!game) { return <></> }

  const category = Object.entries(game.rounds[game.currentRound]);

  return (
    <div className="flex flex-row overflow-x-auto">
      {category.map(([name, questions]) => {
        return <div className="flex flex-col">
          <h1>{name}</h1>
          <hr />
        </div>
      })}
    </div>
  )
}
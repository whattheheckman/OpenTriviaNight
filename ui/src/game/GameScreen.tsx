import { useContext, useState } from "react";
import { GameContext } from "../GameContext";
import CreateGame from "./create/CreateGame";

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

  return (
    
      <div>
        {game 
        ? <div>game exists</div>
        : <CreateGame />
        }
        <code>
          {JSON.stringify(game)}
        </code>
      </div>
    
  )
}
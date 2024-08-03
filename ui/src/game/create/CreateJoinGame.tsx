import { useContext, useState } from "react";
import LabeledTextInput from "../../LabeledTextInput";
import { GameContext } from "../../GameContext";
import { Button, HR } from "flowbite-react";
import CreateGame from "./CreateGame";
import { Game } from "../../Models";

export default function CreateJoinGame() {
  const {username, setUsername, signalR, setGame} = useContext(GameContext);
  const [type, setType] = useState<"join" | "create">("join");
  const [gameId, setGameId] = useState<string>("");

  const joinGame = (role: "Host" | "Contestant" | "Spectator") => {
    signalR
      .invoke("JoinGame", gameId, username, role)
      ?.then((res: Game) => {
        setGame(res);
      })
  }

  if (type === "join") {
    return (
      <div className="flex flex-col gap-2 mt-4 max-w-screen-sm mx-auto">
        <h1 className="font-bold text-2xl">Join Game</h1>
        <LabeledTextInput label="Game ID" name="gameId" type="text" placeholder="ABCDEF" value={gameId} onChange={(e) => setGameId(e.target.value)} />
        <LabeledTextInput label="Your Name" name="username" type="text" placeholder="John" value={username} onChange={(e) => setUsername(e.target.value)} />
        
        <Button color="success" onClick={() => joinGame("Contestant")}>Join as Contestant</Button>
        <Button color="gray" onClick={() => joinGame("Spectator")}>Join as Spectator</Button>
        <Button color="gray" onClick={() => joinGame("Host")}>Join as Host</Button>

        <HR.Text text="or" />

        <Button color="success" outline onClick={() => setType("create")}>Create a Game</Button>
      </div>
    )
  } else {
      return <div className="m-4">
        <div className="flex flex-row justify-between">
          <h1 className="font-bold text-2xl">Create Game</h1>
          <Button outline onClick={() => setType("join")}>Join Game</Button>
        </div>

        <CreateGame />
      </div>
  }
}
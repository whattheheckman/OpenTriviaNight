import { useContext, useEffect, useState } from "react";
import LabeledTextInput from "../../LabeledTextInput";
import { GameContext } from "../../GameContext";
import { Button, HR } from "flowbite-react";
import CreateGame from "./CreateGame";
import About from "../../About";
import useApiClient from "../../useApiClient";

export default function CreateJoinGame() {
  const { username, setUsername, setRole, setGame } = useContext(GameContext);
  const [type, setType] = useState<"join" | "create">("join");
  const [newGameId, setNewGameId] = useState<string>("");
  // False to begin with show that we only show an error after first interaction
  const [gameIdErrorMessage, setGameIdErrorMessage] = useState("");
  const apiClient = useApiClient();

  useEffect(() => {
    // Clear out the error message if the Game ID is cleared
    if (!newGameId) {
      setGameIdErrorMessage("");
    }
  }, [newGameId, setGameIdErrorMessage]);

  const joinGame = (role: "Host" | "Contestant" | "Spectator") => {
    setGameIdErrorMessage("");
    if (!newGameId) {
      setGameIdErrorMessage("Please provide a valid Game ID");
      return;
    }

    if (!newGameId.match(/[A-Z,a-z]{6}/)) {
      setGameIdErrorMessage("Game IDs may only contain 6 characters A-Z");
      return;
    }

    if (!username) {
      return;
    }

    setRole(role);

    apiClient.getGame(newGameId)?.then((res) => setGame(res));
  };

  if (type === "join") {
    return (
      <div className="flex flex-col gap-2 p-4 max-w-screen-lg mx-auto">
        <form className="flex flex-col gap-2 max-w-screen-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
          <h1 className="font-bold text-2xl">Join Game</h1>
          <LabeledTextInput
            label="Game ID"
            name="gameId"
            type="text"
            placeholder="ABCDEF"
            value={newGameId}
            onChange={(e) => setNewGameId(e.target.value)}
            errorMessage={gameIdErrorMessage}
          />
          <LabeledTextInput
            label="Your Name"
            name="username"
            type="text"
            placeholder="John"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Button type="submit" color="success" onClick={() => joinGame("Contestant")}>
            Join as Contestant
          </Button>
          <Button type="submit" color="gray" onClick={() => joinGame("Spectator")}>
            Join as Spectator
          </Button>
          <Button type="submit" color="gray" onClick={() => joinGame("Host")}>
            Join as Host
          </Button>

          <HR.Text text="or" />

          <Button color="success" outline onClick={() => setType("create")}>
            Create a Game
          </Button>
        </form>

        <About />
      </div>
    );
  } else {
    return (
      <div className="m-4">
        <div className="flex flex-row justify-between">
          <h1 className="font-bold text-2xl">Create Game</h1>
          <Button outline onClick={() => setType("join")}>
            Join Game
          </Button>
        </div>

        <CreateGame />
      </div>
    );
  }
}

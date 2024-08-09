import { Button } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game } from "../../Models";
import { GameContext } from "../../GameContext";
import LabeledTextInput from "../../LabeledTextInput";
import CreateRound from "./CreateRound";
import { HiPlus } from "react-icons/hi";
import useApiClient from "../../useApiClient";

export default function CreateGame() {
  const { setGame, setRole, username, setUsername } = useContext(GameContext);
  const apiClient = useApiClient();
  const [request, setRequest] = useState<CreateGameRequest>({
    rounds: [],
  });

  const addRound = () => {
    setRequest((r) => {
      r.rounds.push([]);
      return { ...r };
    });
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    apiClient.createGame(request)?.then((res: Game) => {
      setGame(res);
      setRole("Host");
    });
  };

  return (
    <div>
      <form onSubmit={handleCreateGame} className="gap-4 flex flex-col">
        <LabeledTextInput
          className="max-w-2xl"
          type="text"
          label="Your Name"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {request.rounds.map((round, roundIdx) => {
          return <CreateRound key={roundIdx} round={round} roundNumber={roundIdx} setRequest={setRequest} />;
        })}

        <Button color="info" onClick={addRound}>
          <HiPlus className="h-5 mr-2" />
          Add Round
        </Button>

        <Button type="submit" color="success">
          Create Game
        </Button>
      </form>
    </div>
  );
}

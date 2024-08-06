import { Button } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game } from "../../Models";
import { GameContext } from "../../GameContext";
import LabeledTextInput from "../../LabeledTextInput";
import CreateRound from "./CreateRound";
import { HiPlus } from "react-icons/hi";
import useApiClient from "../../useApiClient";

export default function CreateGame() {
  const { setGame, username, setUsername } = useContext(GameContext);
  const apiClient = useApiClient();
  const [request, setRequest] = useState<CreateGameRequest>({
    username: "",
    rounds: []
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }

  const addRound = () => {
    setRequest(r => {
      r.rounds.push([])
      console.log("round ", r)
      return { ...r }
    })
  }

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    request.username = username
    apiClient
      .createGame(request)
      ?.then((res: Game) => {
        setGame(res);
      })
  }

  return (
    <div>
      <form onSubmit={handleCreateGame} className="gap-4 flex flex-col">
        <LabeledTextInput className="max-w-2xl" type="text" label="Your Name" name="username" value={username} onChange={handleUsernameChange} />

        {request.rounds.map((round, roundIdx) => {
          return <CreateRound key={roundIdx} round={round} roundNumber={roundIdx} setRequest={setRequest} />
        })}

        <Button color="info" onClick={addRound}><HiPlus className="h-5" />Add Round</Button>

        <Button type="submit" color="success">Create Game</Button>
      </form>
    </div>
  )
}
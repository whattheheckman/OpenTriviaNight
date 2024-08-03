import { Button } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game, Question } from "../../Models";
import { GameContext } from "../../GameContext";
import LabeledTextInput from "../../LabeledTextInput";
import CreateRound from "./CreateRound";
import { HiPlus } from "react-icons/hi";

export default function CreateGame() {
  const { setGame, setUsername, signalR } = useContext(GameContext);
  const [request, setRequest] = useState<CreateGameRequest>({
    username: "",
    rounds: []
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest({ ...request, [e.target.name]: e.target.value })
    setUsername(e.target.value);
  }

  const addRound = () => {
    let newQuestion: Question = {
      questionId: crypto.randomUUID(),
      answered: false,
      correctAnswer: "",
      detail: "",
      value: 100
    }
    setRequest({ ...request, rounds: [...request.rounds, { "New Category": [newQuestion] }] })
  }

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    signalR
      .invoke("CreateGame", request)
      ?.then((res: Game) => {
        setGame(res);
      })
  }

  return (
    <div>
      <form onSubmit={handleCreateGame} className="gap-4 flex flex-col">
        <LabeledTextInput className="max-w-2xl" type="text" label="Your Name" name="username" value={request.username} onChange={handleUsernameChange} />

        {request.rounds.map((round, roundIdx) => {
          return <CreateRound key={roundIdx} round={round} roundNumber={roundIdx} setRequest={setRequest} />
        })}

        <Button color="info" onClick={addRound}><HiPlus className="h-5" />Add Round</Button>

        <Button type="submit" color="success">Create Game</Button>
      </form>
    </div>
  )
}
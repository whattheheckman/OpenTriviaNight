import { Button } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game, Question } from "../../Models";
import { GameContext } from "../../GameContext";
import LabeledTextInput from "../../LabeledTextInput";
import { FaPlus } from "react-icons/fa";
import CreateCategory from "./CreateCategory";
import CreateRound from "./CreateRound";
import { HiPlus } from "react-icons/hi";

export default function CreateGame() {
  const { setGame, signalR } = useContext(GameContext);
  const [request, setRequest] = useState<CreateGameRequest>({
    username: "",
    rounds: []
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest({ ...request, [e.target.name]: e.target.value })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signalR
      .invoke("CreateGame", request)
      ?.then((res: Game) => {
        setGame(res);
      })
  }

  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="gap-4 flex flex-col">
        <h1 className="font-bold text-4xl">Create a new Game</h1>
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
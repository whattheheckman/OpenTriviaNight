import { Button, Label, TextInput } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game, Question } from "../Models";
import { GameContext } from "../GameContext";

export default function CreateGame() {
  const { setGame, signalR } = useContext(GameContext);
  const [request, setRequest] = useState<CreateGameRequest>({
    username: "",
    rounds: []
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest({ ...request, [e.target.name]: e.target.value })
  }

  const handleQuestionDataChange = (e: React.ChangeEvent<HTMLInputElement>, round: number, category: string, questionIdx: number) => {
    setRequest(r => {
      r.rounds[round][category][questionIdx] = { ...r.rounds[round][category][questionIdx], [e.target.name]: e.target.value };
      return { ...r };
    })
  }

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>, round: number, category: string) => {
    console.log(e, e.target.value, round, category, request);
    setRequest(r => {
      // Move the value from the old key to the new key
      r.rounds[round] = { ...r.rounds[round], [e.target.value]: r.rounds[round][category] }
      delete r.rounds[round][category];
      return { ...r };
    })
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
    <div className="max-w-2xl mx-auto">
      <h1>Create a new Game</h1>
      <form onSubmit={handleSubmit}>
        <Label value="Your Name" />
        <TextInput id="username" type="text" required name="username" value={request.username} onChange={handleUsernameChange} />

        {request.rounds.map((round, roundIdx) => {
          return (
            <div key={roundIdx}>
              <h2>Round {roundIdx + 1} </h2>

              {Object.entries(round).map(([category, questions], categoryIdx) => {
                return (
                  <div key={categoryIdx}>
                    <Label value="Category Name" />
                    <TextInput id="category-name" type="text" required name="category" value={category} onChange={(e) => handleCategoryNameChange(e, roundIdx, category)} />

                    {questions.map((question, questionIdx) => {
                      return <div key={questionIdx}>
                        <Label value="Question" />
                        <TextInput id="question" type="text" required name="detail" value={question.detail} onChange={(e) => handleQuestionDataChange(e, roundIdx, category, questionIdx)} />
                      </div>
                    })}
                  </div>
                )
              })}

            </div>
          )
        })}

        <Button color="blue" onClick={addRound}>Add Round</Button>

        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
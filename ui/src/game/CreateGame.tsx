import { Button, TextInput } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game, Question } from "../Models";
import { GameContext } from "../GameContext";
import LabeledTextInput from "../LabeledTextInput";
import { FaPlus, FaTrash } from "react-icons/fa";
import { HiTrash } from "react-icons/hi";

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

  const addCategory = (round: number) => {
    let newQuestion: Question = {
      questionId: crypto.randomUUID(),
      answered: false,
      correctAnswer: "",
      detail: "",
      value: 100
    }
    let rounds = request.rounds;
    let newCategoryName = `Category ${Object.entries(rounds[round]).length + 1}`;
    if (newCategoryName in rounds[round]) {
      newCategoryName = crypto.randomUUID();
    }
    rounds[round] = { ...rounds[round], [newCategoryName]: [newQuestion] }
    setRequest({ ...request, rounds: rounds })
  }

  const removeCategory = (round: number, category: string) => {
    setRequest(r => {
      if (r.rounds[round][category]) {
        delete r.rounds[round][category];
      }
      return { ...r };
    })
  }

  const addQuestion = (round: number, category: string) => {
    setRequest(r => {
      let questions = r.rounds[round][category];
      console.log(questions)
      let lastQuestionValue = questions.length > 0 ? questions[questions.length - 1].value : 0;
      let newQuestion: Question = {
        questionId: crypto.randomUUID(),
        detail: "",
        correctAnswer: "",
        answered: false,
        value: lastQuestionValue + 100
      };
      r.rounds[round][category] = [...r.rounds[round][category], newQuestion];
      return { ...r };
    })
  }

  const removeQuestion = (round: number, category: string, question: number) => {
    setRequest(r => {
      if (r.rounds[round][category][question]) {
        r.rounds[round][category] = r.rounds[round][category].filter((_, idx) => idx != question);
      }
      return { ...r };
    })
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
          return (
            <div key={roundIdx}>
              <h2 className="font-semibold">Round {roundIdx + 1} </h2>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(round).map(([category, questions], categoryIdx) => {
                  return (
                    <div className="mb-auto flex flex-col gap-2 bg-sky-200 p-2 rounded-lg border-2 border-sky-500" key={categoryIdx}>
                      <div className="flex gap-2">
                        <TextInput className="flex-grow font-semibold" id="category-name" type="text" required name="category" sizing="sm" value={category} onChange={(e) => handleCategoryNameChange(e, roundIdx, category)} />
                        <Button size="sm" color="red" onClick={() => removeCategory(roundIdx, category)}><HiTrash/></Button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {questions.map((question, questionIdx) => {
                          return <div key={questionIdx} className="p-2 bg-white rounded-md">
                            <div className="flex justify-between">
                              <h2>Question {questionIdx + 1}</h2>
                              <Button size="sm" color="red" onClick={() => removeQuestion(roundIdx, category, questionIdx)}><HiTrash /></Button>
                            </div>
                            <div className="flex flex-col gap-2">
                              <LabeledTextInput label="Question" name="detail" type="text" value={question.detail} onChange={(e) => handleQuestionDataChange(e, roundIdx, category, questionIdx)} />

                              <div className="flex flex-row gap-2">
                                <LabeledTextInput className="grow" label="Correct Answer" name="correctAnswer" type="text" value={question.correctAnswer} onChange={(e) => handleQuestionDataChange(e, roundIdx, category, questionIdx)} />
                                <LabeledTextInput className="w-16" label="Value" name="value" type="number" value={question.value} onChange={(e) => handleQuestionDataChange(e, roundIdx, category, questionIdx)} />
                              </div>
                            </div>
                          </div>
                        })}
                        <Button color="info" onClick={() => addQuestion(roundIdx, category)}><FaPlus />Add Question</Button>

                      </div>
                    </div>
                  )
                })}

                <Button onClick={() => addCategory(roundIdx)}><FaPlus />Add Category</Button>

              </div>
              <hr className="mt-4" />
            </div>
          )
        })}

        <Button color="info" onClick={addRound}><FaPlus />Add Round</Button>

        <Button type="submit" color="success">Create Game</Button>
      </form>
    </div>
  )
}
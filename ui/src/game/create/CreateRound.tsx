import { Button, Modal } from "flowbite-react"
import { CreateGameRequest, Question } from "../../Models"
import CreateCategory from "./CreateCategory"
import { HiPlus } from "react-icons/hi"
import { useState } from "react"
import GenerateCategory from "./GenerateCategory"

type Props = {
  round: { [category: string]: Question[] }
  roundNumber: number,
  setRequest: React.Dispatch<React.SetStateAction<CreateGameRequest>>
}

export default function CreateRound({ round, roundNumber, setRequest }: Props) {
  const [genCategoryOpen, setGenCategoryOpen] = useState(false);

  const addCategory = (round: number, category?: string, questions?: Question[]) => {
    setRequest(r => {
      let newQuestions = questions
        ? questions
        : [{
          questionId: crypto.randomUUID(),
          answered: false,
          correctAnswer: "",
          detail: "",
          value: 100
        }];

      let rounds = r.rounds;
      let newCategoryName = category ? category : `Category ${Object.entries(rounds[round]).length + 1}`;
      if (newCategoryName in rounds[round]) {
        newCategoryName += Math.round(Math.random() * 100);
      }
      rounds[round] = { ...rounds[round], [newCategoryName]: newQuestions }
      return { ...r, rounds: rounds }
    })
  }

  return (
    <div key={roundNumber}>
      <h2 className="font-semibold">Round {roundNumber + 1} </h2>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(round).map(([category, questions], categoryIdx) => {
          return <CreateCategory key={categoryIdx} category={category} questions={questions} setRequest={setRequest} roundNumber={roundNumber} />
        })}

        <div className="flex flex-col gap-2">
          <Button className="items-end" onClick={() => addCategory(roundNumber)}><HiPlus className="h-5 mr-2" /><span>Add Category</span></Button>
          <Button gradientDuoTone="pinkToOrange" onClick={() => setGenCategoryOpen(true)}><HiPlus className="h-5 mr-2" />Generate Category</Button>
        </div>

      </div>

      <hr className="mt-4" />

      <Modal show={genCategoryOpen} size="7xl" dismissible onClose={() => setGenCategoryOpen(false)}>
        <Modal.Header>
          <span>Generate Category</span>
        </Modal.Header>
        <Modal.Body>
          <GenerateCategory onAdd={(category, q) => { addCategory(roundNumber, category, q); setGenCategoryOpen(false) }} />
        </Modal.Body>
      </Modal>
    </div>
  )
}
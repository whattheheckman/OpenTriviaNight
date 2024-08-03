import { Button, Textarea, TextInput } from "flowbite-react"
import { CreateGameRequest, Question } from "../../Models"
import LabeledTextInput from "../../LabeledTextInput"
import { HiPlus, HiTrash } from "react-icons/hi"

type Props = {
  category: string,
  questions: Question[],
  roundNumber: number,
  setRequest: React.Dispatch<React.SetStateAction<CreateGameRequest>>
}

export default function CreateCategory({ category, questions, roundNumber, setRequest }: Props) {
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

  const handleQuestionDataChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, round: number, category: string, questionIdx: number) => {
    setRequest(r => {
      r.rounds[round][category][questionIdx] = { ...r.rounds[round][category][questionIdx], [e.target.name]: e.target.value };
      return { ...r };
    })
  }

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>, round: number, category: string) => {
    setRequest(r => {
      // Move the value from the old key to the new key
      r.rounds[round] = { ...r.rounds[round], [e.target.value]: r.rounds[round][category] }
      delete r.rounds[round][category];
      return { ...r };
    })
  }

  return (
    <div className="mb-auto flex flex-col grow md:grow-0 gap-2 bg-sky-200 p-2 rounded-lg border-2 border-sky-500">
      <div className="flex gap-2">
        <TextInput className="flex-grow font-semibold" id="category-name" type="text" required name="category" placeholder="Category Name" value={category} onChange={(e) => handleCategoryNameChange(e, roundNumber, category)} />
        <Button color="red" onClick={() => removeCategory(roundNumber, category)}>Remove</Button>
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((question, questionIdx) => {
          return <div key={questionIdx} className="p-2 bg-white rounded-md">
            <div className="flex justify-between">
              <h2>Question {questionIdx + 1}</h2>
              <Button size="xs" color="red" onClick={() => removeQuestion(roundNumber, category, questionIdx)}>Remove</Button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Textarea className="p-1 px-2" placeholder="Question" name="detail" required value={question.detail} onChange={(e) => handleQuestionDataChange(e, roundNumber, category, questionIdx)} />

              <div className="flex flex-row gap-2">
                <LabeledTextInput className="grow" label="Correct Answer" name="correctAnswer" type="text" value={question.correctAnswer} onChange={(e) => handleQuestionDataChange(e, roundNumber, category, questionIdx)} />
                <LabeledTextInput className="w-16" label="Value" name="value" type="number" value={question.value} onChange={(e) => handleQuestionDataChange(e, roundNumber, category, questionIdx)} />
              </div>
            </div>
          </div>
        })}
        <Button color="info" onClick={() => addQuestion(roundNumber, category)}><HiPlus className="h-5" />Add Question</Button>

      </div>
    </div>
  )
}
import { Button, Textarea, TextInput } from "flowbite-react"
import { Category, CreateGameRequest, Question } from "../../Models"
import LabeledTextInput from "../../LabeledTextInput"
import { HiPlus } from "react-icons/hi"

type Props = {
  category: Category,
  categoryIndex: number,
  roundNumber: number,
  setRequest: React.Dispatch<React.SetStateAction<CreateGameRequest>>
}

export default function CreateCategory({ category, categoryIndex, roundNumber, setRequest }: Props) {
  const removeCategory = () => {
    setRequest(r => {
      r.rounds[roundNumber] = r.rounds[roundNumber].filter(x => x.categoryId !== category.categoryId)
      return { ...r };
    })
  }

  const addQuestion = () => {
    setRequest(r => {
      let questions = r.rounds[roundNumber][categoryIndex].questions;
      let lastQuestionValue = questions.length > 0 ? questions[questions.length - 1].value : 0;
      let newQuestion: Question = {
        questionId: crypto.randomUUID(),
        detail: "",
        correctAnswer: "",
        answered: false,
        value: lastQuestionValue + 100
      };
      r.rounds[roundNumber][categoryIndex].questions.push(newQuestion)
      return { ...r };
    })
  }

  const removeQuestion = (question: number) => {
    setRequest(r => {
      if (r.rounds[roundNumber][categoryIndex].questions) {
        r.rounds[roundNumber][categoryIndex].questions = r.rounds[roundNumber][categoryIndex].questions.filter((_, idx) => idx != question);
      }
      return { ...r };
    })
  }

  const handleQuestionDataChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, questionIdx: number) => {
    setRequest(r => {
      r.rounds[roundNumber][categoryIndex].questions[questionIdx] = { ...r.rounds[roundNumber][categoryIndex].questions[questionIdx], [e.target.name]: e.target.value };
      return { ...r };
    })
  }

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest(r => {
      r.rounds[roundNumber][categoryIndex].name = e.target.value;
      return { ...r };
    })
  }

  return (
    <div className="mb-auto flex flex-col grow md:grow-0 gap-2 p-2 rounded-lg border-2 border-orange-500">
      <div className="flex gap-2">
        <TextInput className="flex-grow font-semibold" id="category-name" type="text" required name="category" placeholder="Category Name" value={category.name} onChange={(e) => handleCategoryNameChange(e)} />
        <Button color="red" onClick={() => removeCategory()}>Remove</Button>
      </div>

      <div className="flex flex-col gap-2">
        {category.questions.map((question, questionIdx) => {
          return <div key={questionIdx} className="p-2 bg-white rounded-md bg-orange-300">
            <div className="flex justify-between">
              <h2>Question {questionIdx + 1}</h2>
              <Button size="xs" color="red" onClick={() => removeQuestion(questionIdx)}>Remove</Button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Textarea className="p-1 px-2" placeholder="Question" name="detail" required value={question.detail} onChange={(e) => handleQuestionDataChange(e, questionIdx)} />

              <div className="flex flex-row gap-2">
                <LabeledTextInput className="grow" label="Correct Answer" name="correctAnswer" type="text" value={question.correctAnswer} onChange={(e) => handleQuestionDataChange(e, questionIdx)} />
                <LabeledTextInput className="w-16" label="Value" name="value" type="number" value={question.value} onChange={(e) => handleQuestionDataChange(e, questionIdx)} />
              </div>
            </div>
          </div>
        })}
        <Button color="info" onClick={addQuestion}><HiPlus className="h-5" />Add Question</Button>

      </div>
    </div>
  )
}
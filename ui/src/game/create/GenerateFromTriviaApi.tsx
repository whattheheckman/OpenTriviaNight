import { Button, Label, Select, Spinner } from "flowbite-react";
import { Question } from "../../Models";
import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";

type Props = {
  updateQuestions: (category: string, questions: Question[]) => void;
}

type TriviaQuestionResponse = {
  correctAnswer: string,
  question: { text: string }
}

const CATEGORIES: { id: string, name: string }[] = [
  {
    id: "music",
    name: "Music"
  },
  {
    id: "sport_and_leisure",
    name: "Sport & Leisure"
  },
  {
    id: "film_and_tv",
    name: "Filn & TV"
  },
  {
    id: "arts_and_literature",
    name: "Arts & Literature"
  },
  {
    id: "history",
    name: "History"
  },
  {
    id: "society_and_culture",
    name: "Society & Culture"
  },
  {
    id: "science",
    name: "Scient"
  },
  {
    id: "geography",
    name: "Geography"
  },
  {
    id: "food_and_drink",
    name: "Food & Drink"
  },
  {
    id: "general_knowledge",
    name: "General Knowledge"
  }
]

export default function GenerateFromTriviaApi({ updateQuestions }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("general_knowledge");
  const [difficulty, setDifficulty] = useState<string>("easy");

  const generateQuestions = () => {
    // TODO: Support tags for more fine grained categories
    fetch(`https://the-trivia-api.com/v2/questions?limit=5&categories=${selectedCategory}&difficulties=${difficulty}&types=text_choice`)
      .then(res => res.json())
      .then((res: TriviaQuestionResponse[]) => {
        let questions: Question[] = res.map((r, count) => {
          return {
            questionId: crypto.randomUUID(),
            detail: r.question.text,
            correctAnswer: r.correctAnswer,
            value: (count + 1) * 100,
            answered: false
          }
        });
        let category = CATEGORIES.find(x => x.id == selectedCategory)
        updateQuestions(category?.name ?? "Unknown", questions);
      })
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 grow">
          <Label className="mt-1" htmlFor="categories" value="Select Category" />
          <Select id="categories" required value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {CATEGORIES.map(c => {
              return <option value={c.id}>{c.name}</option>
            })}
          </Select>
        </div>

        <div className="flex-1 grow">
          <Label className="mt-2" htmlFor="difficulty" value="Select Difficulty" />
          <Select id="difficulty" required value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
      </div>

      <Button className="mt-4" gradientDuoTone="pinkToOrange" onClick={generateQuestions}><HiOutlineRefresh className="h-5 mr-2" />Generate Questions</Button>

    </div>
  )
}

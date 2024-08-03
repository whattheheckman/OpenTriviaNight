import { Button, Label, Select, Spinner, Table } from "flowbite-react";
import { Question } from "../../Models";
import { useEffect, useState } from "react";
import { HiCheck, HiOutlineRefresh } from "react-icons/hi";

type Props = {
  onAdd: (category: string, questions: Question[]) => void;
}

type OpenTDBCategory = {
  id: number,
  name: string
}

type OpenTDBQuestionResponse = {
  response_code: number,
  results: { question: string, correct_answer: string }[]
}

export default function GenerateFromOpenTDB({ onAdd }: Props) {
  const [categories, setCategories] = useState<OpenTDBCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [difficulty, setDifficulty] = useState<string>("easy");

  useEffect(() => {
    fetch("https://opentdb.com/api_category.php")
      .then(res => res.json())
      .then(res => setCategories(res.trivia_categories))
  }, []);

  const generateQuestions = () => {
    fetch(`https://opentdb.com/api.php?amount=5&category=${selectedCategory}&difficulty=${difficulty}&type=multiple&encode=url3986`)
      .then(res => res.json())
      .then((res: OpenTDBQuestionResponse) => {
        let questions: Question[] = res.results.map((r, count) => {
          return {
            questionId: crypto.randomUUID(),
            detail: decodeURIComponent(r.question),
            correctAnswer: decodeURIComponent(r.correct_answer),
            value: (count + 1) * 100,
            answered: false
          }
        });
        setQuestions(questions);
      })
  }

  const finalize = () => {
    let category = categories.find(x => x.id == selectedCategory);
    onAdd(category?.name ?? "Unknown", questions);
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="grow">
          <Label className="mt-2" htmlFor="difficulty" value="Select Difficulty" />
          <Select id="difficulty" required value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>

        <div className="grow">
          <Label className="mt-1" htmlFor="categories" value="Select Category" />
          {categories
            ? <Select id="categories" required value={selectedCategory} onChange={e => setSelectedCategory(parseInt(e.target.value))}>
              {categories.map(c => {
                return <option value={c.id}>{c.name}</option>
              })}
            </Select>
            : <Spinner />
          }
        </div>
      </div>

      <Button className="mt-4" gradientDuoTone="pinkToOrange" onClick={generateQuestions}><HiOutlineRefresh className="h-5 mr-2" />Generate Questions</Button>

      {questions.length > 0
        ? <Table className="my-4" striped>
          <Table.Head>
            <Table.HeadCell>Question</Table.HeadCell>
            <Table.HeadCell>Correct Answer</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {questions.map(q => {
              return <Table.Row>
                <Table.Cell className="py-2">{q.detail}</Table.Cell>
                <Table.Cell className="py-2">{q.correctAnswer}</Table.Cell>
              </Table.Row>
            })}
          </Table.Body>
        </Table>
        : <></>}

      {questions.length > 0
        ? <Button className="mt-4" type="button" color="success" onClick={finalize}><HiCheck className="h-5 mr-2" />Use these Questions</Button>
        : <></>}

    </div>
  )
}

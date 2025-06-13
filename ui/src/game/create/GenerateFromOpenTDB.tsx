import { Button, Label, Select } from "flowbite-react";
import { Question } from "../../Models";
import { useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import useApiClient from "../../useApiClient";

type Props = {
  updateQuestions: (category: string, questions: Question[]) => void;
};

// These categories are available at the API https://opentdb.com/api_category.php
// Hardcoding these because constantly pinging the API for these seems like overkill
const CATEGORIES = [
  {
    id: 9,
    name: "General Knowledge",
  },
  {
    id: 10,
    name: "Entertainment: Books",
  },
  {
    id: 11,
    name: "Entertainment: Film",
  },
  {
    id: 12,
    name: "Entertainment: Music",
  },
  {
    id: 13,
    name: "Entertainment: Musicals & Theatres",
  },
  {
    id: 14,
    name: "Entertainment: Television",
  },
  {
    id: 15,
    name: "Entertainment: Video Games",
  },
  {
    id: 16,
    name: "Entertainment: Board Games",
  },
  {
    id: 17,
    name: "Science & Nature",
  },
  {
    id: 18,
    name: "Science: Computers",
  },
  {
    id: 19,
    name: "Science: Mathematics",
  },
  {
    id: 20,
    name: "Mythology",
  },
  {
    id: 21,
    name: "Sports",
  },
  {
    id: 22,
    name: "Geography",
  },
  {
    id: 23,
    name: "History",
  },
  {
    id: 24,
    name: "Politics",
  },
  {
    id: 25,
    name: "Art",
  },
  {
    id: 26,
    name: "Celebrities",
  },
  {
    id: 27,
    name: "Animals",
  },
  {
    id: 28,
    name: "Vehicles",
  },
  {
    id: 29,
    name: "Entertainment: Comics",
  },
  {
    id: 30,
    name: "Science: Gadgets",
  },
  {
    id: 31,
    name: "Entertainment: Japanese Anime & Manga",
  },
  {
    id: 32,
    name: "Entertainment: Cartoon & Animations",
  },
];

type OpenTDBQuestionResponse = {
  response_code: number;
  results: { question: string; correct_answer: string }[];
};

export default function GenerateFromOpenTDB({ updateQuestions }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number>(9);
  const [difficulty, setDifficulty] = useState<string>("easy");

  const apiClient = useApiClient();

  const generateQuestions = () => {
    apiClient.getQuestionsFromOpenTDB({ category: selectedCategory, difficulty: difficulty })?.then((res: OpenTDBQuestionResponse) => {
      const questions: Question[] = res.results.map((r, count) => {
        return {
          questionId: crypto.randomUUID(),
          detail: decodeURIComponent(r.question),
          correctAnswer: decodeURIComponent(r.correct_answer),
          value: (count + 1) * 100,
          answered: false,
        };
      });
      const category = CATEGORIES.find((x) => x.id == selectedCategory);
      updateQuestions(category?.name ?? "Unknown", questions);
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 grow">
          <Label className="mt-1" htmlFor="categories">Select Category</Label>
          <Select id="categories" required value={selectedCategory} onChange={(e) => setSelectedCategory(parseInt(e.target.value))}>
            {CATEGORIES.map((c) => {
              return (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              );
            })}
          </Select>
        </div>

        <div className="flex-1 grow">
          <Label className="mt-2" htmlFor="difficulty">Select Difficulty</Label>
          <Select id="difficulty" required value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
      </div>

      <Button
        className="mt-4 bg-linear-to-br from-pink-500 to-orange-400 text-white hover:bg-linear-to-bl focus:ring-pink-200 dark:focus:ring-pink-800"
        onClick={generateQuestions}
      >
        <HiOutlineRefresh className="h-5 mr-2" />
        Generate Questions
      </Button>
    </div>
  );
}

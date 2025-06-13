import { Button, Textarea, TextInput } from "flowbite-react";
import { Category, CreateGameRequest, Question } from "../../Models";
import LabeledTextInput from "../../LabeledTextInput";
import { HiPlus } from "react-icons/hi";

type Props = {
  category: Category;
  categoryIndex: number;
  roundNumber: number;
  setRequest: React.Dispatch<React.SetStateAction<CreateGameRequest>>;
};

export default function CreateCategory({ category, categoryIndex, roundNumber, setRequest }: Props) {
  const removeCategory = () => {
    setRequest((r) => {
      r.rounds[roundNumber] = r.rounds[roundNumber].filter((x) => x.categoryId !== category.categoryId);
      return { ...r };
    });
  };

  const addQuestion = () => {
    setRequest((r) => {
      const questions = r.rounds[roundNumber][categoryIndex].questions;
      const lastQuestionValue = questions.length > 0 ? questions[questions.length - 1].value : 0;
      const newQuestion: Question = {
        questionId: crypto.randomUUID(),
        detail: "",
        correctAnswer: "",
        answered: false,
        value: Number(lastQuestionValue) + 100,
      };
      r.rounds[roundNumber][categoryIndex].questions.push(newQuestion);
      return { ...r };
    });
  };

  const removeQuestion = (question: number) => {
    setRequest((r) => {
      if (r.rounds[roundNumber][categoryIndex].questions) {
        r.rounds[roundNumber][categoryIndex].questions = r.rounds[roundNumber][categoryIndex].questions.filter((_, idx) => idx != question);
      }
      return { ...r };
    });
  };

  const handleQuestionDataChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    questionIdx: number
  ) => {
    setRequest((r) => {
      r.rounds[roundNumber][categoryIndex].questions[questionIdx] = {
        ...r.rounds[roundNumber][categoryIndex].questions[questionIdx],
        [e.target.name]: e.target.value,
      };
      return { ...r };
    });
  };

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest((r) => {
      r.rounds[roundNumber][categoryIndex].name = e.target.value;
      return { ...r };
    });
  };

  return (
    <div className="mb-auto flex flex-col grow md:grow-0 gap-2 rounded-lg">
      <div className="flex gap-2">
        <TextInput
          className="grow font-semibold"
          id="category-name"
          type="text"
          required
          name="category"
          placeholder="Category Name"
          value={category.name}
          onChange={(e) => handleCategoryNameChange(e)}
        />
        <Button color="red" onClick={() => removeCategory()}>
          Remove
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {category.questions.map((question, questionIdx) => {
          return (
            <div key={questionIdx} className="p-2 rounded-xl bg-orange-200">
              <div className="flex flex-col gap-1">
                <Textarea
                  className="p-1 px-2 bg-white"
                  placeholder="What do you get if you multiply six by nine?"
                  name="detail"
                  required
                  value={question.detail}
                  onChange={(e) => handleQuestionDataChange(e, questionIdx)}
                />

                <div className="flex flex-row gap-2 items-end">
                  <LabeledTextInput
                    className="grow"
                    label="Correct Answer"
                    placeholder="42"
                    name="correctAnswer"
                    type="text"
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionDataChange(e, questionIdx)}
                  />
                  <LabeledTextInput
                    className="w-16"
                    label="Value"
                    name="value"
                    type="number"
                    value={question.value}
                    onChange={(e) => handleQuestionDataChange(e, questionIdx)}
                  />
                  <Button className="self-end items-center p-1" size="xs" color="red" onClick={() => removeQuestion(questionIdx)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        <Button color="blue" size="sm" onClick={addQuestion}>
          <HiPlus className="h-5" />
          Add Question
        </Button>
      </div>
    </div>
  );
}

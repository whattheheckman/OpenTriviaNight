import { Button, HR, Modal } from "flowbite-react";
import { CreateGameRequest, Category, Question } from "../../Models";
import CreateCategory from "./CreateCategory";
import { HiPlus, HiTrash} from "react-icons/hi";
import { useState } from "react";
import GenerateCategory from "./GenerateCategory";

type Props = {
  round: Category[];
  roundNumber: number;
  setRequest: React.Dispatch<React.SetStateAction<CreateGameRequest>>;
};

export default function CreateRound({ round, roundNumber, setRequest }: Props) {
  const [genCategoryOpen, setGenCategoryOpen] = useState(false);

  const addCategory = (round: number, category?: string, questions?: Question[]) => {
    setRequest((r) => {
      const newQuestions = questions
        ? questions
        : [
            {
              questionId: crypto.randomUUID(),
              answered: false,
              correctAnswer: "",
              detail: "",
              value: 100,
            },
          ];

      const rounds = r.rounds;
      let newCategoryName = category ? category : `Category ${rounds[round].length + 1}`;
      if (newCategoryName in rounds[round]) {
        newCategoryName += Math.round(Math.random() * 100);
      }
      rounds[round].push({ categoryId: crypto.randomUUID(), name: newCategoryName, questions: newQuestions });
      return { ...r, rounds: rounds };
    });
  };

  const removeRound = () => {
    setRequest((r) => {
      r.rounds.splice(roundNumber, 1);
      return { ...r };
    });
  };

  return (
    <div className="flex flex-col">
      <HR.Text text={`Round ${roundNumber + 1}`} />
      <div className="flex gap-2 self-center">
        <Button size="sm" onClick={() => addCategory(roundNumber)}>
          <HiPlus className="h-5 mr-2" />
          <span>Add Category</span>
        </Button>
        <Button gradientDuoTone="pinkToOrange" size="sm" onClick={() => setGenCategoryOpen(true)}>
          <HiPlus className="h-5 mr-2" />
          Generate Category
        </Button>
        <Button className="" size="sm" color="red" onClick={removeRound}>
          <HiTrash className="h-5 mr-2" />
          Remove Round
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap mt-4">
        {round.map((category, categoryIdx) => {
          return (
            <CreateCategory
              key={categoryIdx}
              category={category}
              categoryIndex={categoryIdx}
              setRequest={setRequest}
              roundNumber={roundNumber}
            />
          );
        })}

        <div className="flex flex-col gap-2"></div>
      </div>

      <Modal show={genCategoryOpen} size="7xl" dismissible onClose={() => setGenCategoryOpen(false)}>
        <Modal.Header>
          <span>Generate Category</span>
        </Modal.Header>
        <Modal.Body>
          <GenerateCategory
            onAdd={(category, q) => {
              addCategory(roundNumber, category, q);
              setGenCategoryOpen(false);
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

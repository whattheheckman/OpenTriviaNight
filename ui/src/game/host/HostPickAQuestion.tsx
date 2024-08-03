import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Button } from "flowbite-react";

export default function HostPickAQuestion() {
  const { game } = useContext(GameContext);

  if (!game) { return <></> }

  const category = Object.entries(game.rounds[game.currentRound]);

  console.log(category)

  return (
    <div className="flex flex-row overflow-x-auto mt-4 px-2 min-h-96 h-full grow">
      {category.map(([name, questions]) => {
        return <div className="flex flex-col min-w-48 grow flex-1 mx-2 gap-4">
          <h1 className="text-center text-2xl font-bold min-h-16">{name}</h1>

          <hr className="my-4" />

          {questions.map(q => {
            return q.answered 
            ? <div className="h-16"> </div>
            : <Button key={q.questionId} className="flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white rounded-lg h-16" color="none">
              <span className="text-xl">{q.value}</span>
            </Button>
          })}

        </div>
      })}
    </div>
  )
}
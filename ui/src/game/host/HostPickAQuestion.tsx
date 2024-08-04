import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Button } from "flowbite-react";

export default function HostPickAQuestion() {
  const { game, signalR } = useContext(GameContext);

  if (!game) { return <></> }

  const category = Object.entries(game.rounds[game.currentRound]);

  const pickQuestion = (questionId: string) => {
    signalR.invoke("PickQuestion", questionId);
  }

  return (
    <div className="flex flex-col grow py-4">
      <div className="flex flex-row overflow-x-auto px-2 min-h-96 h-full grow">
        {category.map(([name, questions]) => {
          return <div className="flex flex-col min-w-48 grow flex-1 mx-2 gap-4">
            <h1 className="text-center text-2xl font-bold min-h-16">{name}</h1>

            <hr className="my-4" />

            {questions.map(q => {
              return q.answered
                ? <div key={q.questionId} className="bg-gray-200 min-h-16 grow rounded-lg"> </div>
                : <Button key={q.questionId} className="flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white rounded-lg min-h-16 grow" color="none" onClick={() => pickQuestion(q.questionId)}>
                  <span className="text-xl">{q.value}</span>
                </Button>
            })}

          </div>
        })}
      </div>
      {game.lastWinner
        ? <span>{game.lastWinner} to pick</span>
        : <></>
      }
    </div>
  )
}
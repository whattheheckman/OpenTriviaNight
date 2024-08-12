import { Button } from "flowbite-react";
import { useContext } from "react";
import { GameContext } from "../../GameContext";
import PlayerScoreBox from "./PlayerScoreBox";

export default function QuestionBoard({ onQuestionClick }: { onQuestionClick?: (questionId: string) => void }) {
  const { game } = useContext(GameContext);

  if (!game || !game.rounds[game.currentRound]) {
    return <></>;
  }

  const categories = game.rounds[game.currentRound];
  return (
    <div className="flex flex-col grow py-4">
      <h1 className="text-center text-xl mb-2">Round {game.currentRound + 1}</h1>
      <div className="flex flex-row overflow-x-auto px-2 min-h-96 h-full grow">
        {categories.map(({ name, questions }, idx) => {
          return (
            <div key={idx} className="flex flex-col min-w-40 grow flex-1 mx-2 gap-4">
              <h1 className="text-center text-lg md:text-2xl font-bold min-h-14 md:min-h-16">{name}</h1>

              <hr />

              {questions.map((q) => {
                return q.answered ? (
                  <div key={q.questionId} className="bg-gray-200 min-h-12 flex-1 rounded-lg"></div>
                ) : onQuestionClick ? (
                  <Button
                    key={q.questionId}
                    className="flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white rounded-lg min-h-12 flex-1 p-0"
                    color="none"
                    onClick={() => onQuestionClick(q.questionId)}
                  >
                    <span className="font-bold text-2xl md:text-6xl">{q.value}</span>
                  </Button>
                ) : (
                  <div
                    key={q.questionId}
                    className="flex items-center justify-center bg-orange-400 text-white rounded-lg min-h-12 flex-1 p-0"
                  >
                    <span className="font-bold text-2xl md:text-6xl">{q.value}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex flex-row overflow-x-auto px-2 mt-4">
        {game.players
          .filter((x) => x.role === "Contestant")
          .map((player) => (
            <PlayerScoreBox key={player.username} player={player} highlight={player.username === game.lastWinner} rounded={true} />
          ))}
      </div>
    </div>
  );
}

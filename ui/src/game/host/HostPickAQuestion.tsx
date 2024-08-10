import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Button } from "flowbite-react";
import useApiClient from "../../useApiClient";
import PlayerScoreBox from "../common/PlayerScoreBox";

export default function HostPickAQuestion() {
  const { game } = useContext(GameContext);
  const apiClient = useApiClient();

  if (!game) {
    return <></>;
  }

  const categories = game.rounds[game.currentRound];

  const pickQuestion = (questionId: string) => {
    apiClient.pickQuestion(questionId);
  };

  return (
    <div className="flex flex-col grow py-4">
      <h1 className="text-center text-xl mb-2">Round {game.currentRound + 1}</h1>
      <div className="flex flex-row overflow-x-auto px-2 min-h-96 h-full grow">
        {categories.map(({ name, questions }, idx) => {
          return (
            <div key={idx} className="flex flex-col min-w-48 grow flex-1 mx-2 gap-4">
              <h1 className="text-center text-2xl font-bold min-h-16">{name}</h1>

              <hr className="my-2" />

              {questions.map((q) => {
                return q.answered ? (
                  <div key={q.questionId} className="bg-gray-200 min-h-16 flex-1 rounded-lg">
                  </div>
                ) : (
                  <Button
                    key={q.questionId}
                    className="flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white rounded-lg min-h-16 flex-1 p-0"
                    color="none"
                    onClick={() => pickQuestion(q.questionId)}
                  >
                    <span className="font-bold text-2xl md:text-6xl">{q.value}</span>
                  </Button>
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
            <PlayerScoreBox key={player.username} player={player} highlight={player.username === game.lastWinner} />
          ))}
      </div>
    </div>
  );
}

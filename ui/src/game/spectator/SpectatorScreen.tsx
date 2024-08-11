import { useContext } from "react";
import { GameContext } from "../../GameContext";
import PlayerScoreBox from "../common/PlayerScoreBox";
import { GameHelper } from "../../GameHelper";

export default function SpectatorScreen() {
  const { game } = useContext(GameContext);

  if (!game) {
    return <></>;
  }

  const categories = game.rounds[game.currentRound];

  const footer = (
    <div className="flex flex-row overflow-x-auto px-2">
      {game.players
        .filter((x) => x.role === "Contestant")
        .map((player) => (
          <PlayerScoreBox key={player.username} player={player} highlight={player.username === game.lastWinner} />
        ))}
    </div>
  );

  if (game.state.state === "PickAQuestion") {
    return (
      <div className="flex flex-col grow py-4">
        <h1 className="text-center text-xl mb-2">Round {game.currentRound + 1}</h1>
        <div className="flex flex-row overflow-x-auto px-2 min-h-96 h-full grow mb-4">
          {categories.map(({ name, questions }, idx) => {
            return (
              <div key={idx} className="flex flex-col min-w-40 grow flex-1 mx-2 gap-4">
                <h1 className="text-center text-2xl font-bold min-h-16">{name}</h1>

                <hr className="my-2" />

                {questions.map((q) => {
                  return q.answered ? (
                    <div key={q.questionId} className="bg-gray-200 min-h-12 flex-1 rounded-lg"></div>
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
        {footer}
      </div>
    );
  }

  if (!("question" in game.state)) {
    return <></>;
  }

  const question = game.state.question;
  const { category } = GameHelper.getQuestionById(game, question.questionId);

  let bottomBar = <></>;
  switch (game.state.state) {
    case "ReadQuestion":
      bottomBar = <span>Host is reading the question...</span>;
      break;
    case "WaitingForAnswer":
      bottomBar = <span>Waiting for a player to buzz in...</span>;
      break;
    case "CheckAnswer":
      bottomBar = <span className="text-lg font-bold">{game.state.player.username} has buzzed in!</span>;
      break;
  }

  return (
    <div className="flex flex-col grow mb-4">
      <div className="flex flex-col flex-1 grow bg-orange-400 w-100 m-4 rounded-xl">
        <div className="flex flex-col items-center justify-between p-4 grow">
          <div className="text-lg">
            <span>
              {category.name} - {question.value}
            </span>
          </div>
          <div className="text-4xl text-center">
            <span>{question.detail}</span>
          </div>

          <div>{bottomBar}</div>
        </div>
      </div>
      {footer}
    </div>
  );
}

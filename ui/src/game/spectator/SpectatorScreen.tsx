import { useContext } from "react";
import { GameContext } from "../../GameContext";
import PlayerScoreBox from "../common/PlayerScoreBox";
import { GameHelper } from "../../GameHelper";
import QuestionBoard from "../common/QuestionBoard";

export default function SpectatorScreen() {
  const { game } = useContext(GameContext);

  if (!game) {
    return <></>;
  }

  if (game.state.state === "PickAQuestion") {
    return <QuestionBoard />;
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

  const footer = (
    <div className="flex flex-row overflow-x-auto px-2">
      {game.players
        .filter((x) => x.role === "Contestant")
        .map((player) => (
          <PlayerScoreBox key={player.username} player={player} highlight={player.username === game.lastWinner} rounded={true} />
        ))}
    </div>
  );

  return (
    <div className="flex flex-col grow mb-4">
      <div className="flex flex-col flex-1 grow bg-orange-400 m-4 rounded-xl">
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

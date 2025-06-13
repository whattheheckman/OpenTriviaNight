import { useCallback, useContext, useEffect, useState } from "react";
import { GameContext } from "../../GameContext";
import { Button, Spinner } from "flowbite-react";
import useApiClient from "../../useApiClient";
import PlayerScoreBox from "../common/PlayerScoreBox";
import QuestionBoard from "../common/QuestionBoard";
import { HiChevronLeft } from "react-icons/hi2";

function Wrapper({ children }: React.PropsWithChildren) {
  return <div className="flex flex-col items-stretch text-center justify-between grow mb-8 md:mb-16 text-center">{children}</div>;
}

export default function ContestantScreen() {
  const [boardShown, setBoardShown] = useState(false);
  const { game, username } = useContext(GameContext);
  const apiClient = useApiClient();

  const handleAnswerKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        apiClient.answerQuestion();
      }

      if (e.key === "Escape") {
        setBoardShown(false);
      }
    },
    [apiClient, setBoardShown]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleAnswerKeyPress);
    return () => {
      document.removeEventListener("keydown", handleAnswerKeyPress);
    };
  }, [handleAnswerKeyPress]);

  useEffect(() => {
    // Hide the board when the game state is no longer PickAQuestion
    if (boardShown && game?.state.state !== "PickAQuestion") {
      setBoardShown(false);
    }
  }, [boardShown, setBoardShown, game?.state.state]);

  if (!game) return <></>;

  const player = game.players.find((x) => x.username == username);
  if (!player) return <></>;

  const header = (
    <div>
      <PlayerScoreBox player={player} highlight={true} />
    </div>
  );

  const footer = (
    <div className="mx-auto">
      <Button
        size="xl"
        className="flex items-center text-lg h-32 w-32 rounded-full bg-linear-to-r from-red-400 via-red-500 to-red-600 text-white hover:bg-linear-to-br focus:ring-red-300 dark:focus:ring-red-800"
        disabled={game.state.state !== "WaitingForAnswer"}
        onClick={apiClient.answerQuestion}
      >
        Answer
      </Button>
    </div>
  );

  switch (game.state.state) {
    case "PickAQuestion":
      return boardShown ? (
        <div className="flex flex-col grow">
          <QuestionBoard />
          <Button className="mx-4 mb-2" outline onClick={() => setBoardShown(false)}>
            <HiChevronLeft className="h-5 mr-1" />
            <span>Return</span>
          </Button>
        </div>
      ) : (
        <Wrapper>
          {header}
          <div className="flex flex-col">
            <Spinner size="xl" className="my-2" />
            <span>Waiting for Host to pick a question</span>
          </div>
          <Button className="self-center" onClick={() => setBoardShown(true)}>
            Show Question Board
          </Button>
        </Wrapper>
      );
    case "ReadQuestion":
      return (
        <Wrapper>
          {header}
          <span className="text-lg font-semibold">{game.state.question.detail}</span>
          <span className="text-sm text-gray-500">Waiting for Host to finish reading the question...</span>
          {footer}
        </Wrapper>
      );
    case "WaitingForAnswer":
      return (
        <Wrapper>
          {header}
          <span className="text-lg font-semibold">{game.state.question.detail}</span>
          <span className="text-sm">&nbsp;</span>
          {footer}
        </Wrapper>
      );
    case "CheckAnswer":
      return (
        <Wrapper>
          {header}
          <span className="text-lg font-semibold">{game.state.question.detail}</span>
          {game.state.player.username === username ? (
            <span className="text-sm font-bold text-green-800">You've buzzed in first</span>
          ) : (
            <span className="text-sm text-gray-500">{game.state.player.username} buzzed in first</span>
          )}
          {footer}
        </Wrapper>
      );
  }
}

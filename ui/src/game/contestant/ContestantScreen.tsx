import { useCallback, useContext, useEffect } from "react";
import { GameContext } from "../../GameContext";
import { Button, Spinner } from "flowbite-react";
import useApiClient from "../../useApiClient";
import PlayerScoreBox from "../common/PlayerScoreBox";

function Wrapper({ children }: React.PropsWithChildren) {
  return <div className="flex flex-col items-stretch text-center justify-between grow mb-8 md:mb-16 text-center">{children}</div>;
}

export default function ContestantScreen() {
  const { game, username } = useContext(GameContext);
  const apiClient = useApiClient();

  const handleAnswerKeyPress = useCallback(
    (e: KeyboardEvent) => {
      console.log("key pressed", e);
      if (e.key === "Enter") {
        apiClient.answerQuestion();
      }
    },
    [apiClient]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleAnswerKeyPress);
    return () => {
      document.removeEventListener("keydown", handleAnswerKeyPress);
    };
  }, [handleAnswerKeyPress]);

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
        gradientMonochrome="failure"
        className="flex items-center text-lg p-4 rounded-full aspect-square"
        disabled={game.state.state !== "WaitingForAnswer"}
        onClick={apiClient.answerQuestion}
      >
        Answer
      </Button>
    </div>
  );

  switch (game.state.state) {
    case "PickAQuestion":
      return (
        <Wrapper>
          {header}
          <Spinner size="xl" className="my-2" />
          <span>Waiting for Host to pick a question</span>
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

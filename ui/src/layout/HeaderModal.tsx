import { useContext } from "react";
import PlayerScoreTable from "../game/common/PlayerScoreTable";
import { GameContext } from "../GameContext";
import { Button, Modal } from "flowbite-react";
import useApiClient from "../useApiClient";

export default function HeaderModal({ onLeaveGame }: { onLeaveGame: () => void }) {
  const { game, setGame } = useContext(GameContext);
  const apiClient = useApiClient();

  const leaveGame = () => {
    setGame(undefined);
    apiClient.leaveGame();
    onLeaveGame();
  };

  if (!game) {
    return (
      <div>
        <p>When you're inside a game, you can use this dialog to view the scores of the other players, and leave the game.</p>
      </div>
    );
  }

  return (
    <Modal.Body>
      <div className="flex flex-col gap-4">
        <PlayerScoreTable />
        <Button className="mt-12" color="failure" onClick={leaveGame}>
          Leave Game
        </Button>
      </div>
    </Modal.Body>
  );
}

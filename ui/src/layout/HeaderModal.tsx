import { useContext } from "react";
import PlayerScoreTable from "../game/common/PlayerScoreTable";
import { GameContext } from "../GameContext";
import { Accordion, Button } from "flowbite-react";
import useApiClient from "../useApiClient";
import GameLogTable from "../game/common/GameLogTable";

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
      <div className="text-center">
        <p>When you're inside a game, you can use this dialog to view the scores of the other players, and leave the game.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-screen-md mx-auto">
      <Accordion>
        <Accordion.Panel>
          <Accordion.Title className="py-2">Results</Accordion.Title>
          <Accordion.Content className="p-0">
            <PlayerScoreTable />
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>

      <Accordion collapseAll>
        <Accordion.Panel>
          <Accordion.Title className="py-2">Game Log</Accordion.Title>
          <Accordion.Content className="p-0">
            <GameLogTable />
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>

      <Button className="mt-12" color="failure" onClick={leaveGame}>
        Leave Game
      </Button>
    </div>
  );
}

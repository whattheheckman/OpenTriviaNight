import { useContext } from "react";
import PlayerScoreTable from "../game/common/PlayerScoreTable";
import { GameContext } from "../GameContext";
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, Button } from "flowbite-react";
import useApiClient from "../useApiClient";
import GameLogTable from "../game/common/GameLogTable";
import ManagePreferences from "../game/common/ManagePreferences";

export default function HeaderModal({ onLeaveGame }: { onLeaveGame: () => void }) {
  const { game, setGame } = useContext(GameContext);
  const apiClient = useApiClient();

  const leaveGame = () => {
    setGame(undefined);
    apiClient.leaveGame();
    onLeaveGame();
  };

  const gameInfo = game ? (
    <>
      <Accordion>
        <AccordionPanel>
          <AccordionTitle className="py-2">Results</AccordionTitle>
          <AccordionContent className="p-0">
            <PlayerScoreTable />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <Accordion collapseAll>
        <AccordionPanel>
          <AccordionTitle className="py-2">Game Log</AccordionTitle>
          <AccordionContent className="p-0">
            <GameLogTable />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </>
  ) : (
    <div className="text-center">
      <p>When you're inside a game, you can use this dialog to view the scores of the other players, and leave the game.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-md) mx-auto px-4">
      {gameInfo}
      
      <Accordion collapseAll>
        <AccordionPanel>
          <AccordionTitle className="py-2">Preferences</AccordionTitle>
          <AccordionContent>
            <ManagePreferences />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      {game && (
        <Button className="mt-12" color="red" onClick={leaveGame}>
          Leave Game
        </Button>
      )}
    </div>
  );
}

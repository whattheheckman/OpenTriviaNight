import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, Button } from "flowbite-react";
import PlayerScoreTable from "./common/PlayerScoreTable";
import { useContext } from "react";
import { GameContext } from "../GameContext";
import GameLogTable from "./common/GameLogTable";

export default function GameFinishedScreen() {
  const { setGame } = useContext(GameContext);

  return (
    <div className="flex flex-col text-center items-stretch gap-4 my-4 mx-auto">
      <span className="text-xl">Game Finished!</span>
      <Accordion>
        <AccordionPanel>
          <AccordionTitle className="py-2">Results</AccordionTitle>
          <AccordionContent className="p-0">
            <PlayerScoreTable />
          </AccordionContent>
        </AccordionPanel>

        <AccordionPanel>
          <AccordionTitle className="py-2">Game Log</AccordionTitle>
          <AccordionContent className="p-0">
            <GameLogTable />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
      <Button onClick={() => setGame(undefined)}>Leave Game</Button>
    </div>
  );
}

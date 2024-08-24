import { Accordion, Button } from "flowbite-react";
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
        <Accordion.Panel>
          <Accordion.Title className="py-2">Results</Accordion.Title>
          <Accordion.Content className="p-0">
            <PlayerScoreTable />
          </Accordion.Content>
        </Accordion.Panel>

        <Accordion.Panel>
          <Accordion.Title className="py-2">Game Log</Accordion.Title>
          <Accordion.Content className="p-0">
            <GameLogTable />
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>
      <Button onClick={() => setGame(undefined)}>Leave Game</Button>
    </div>
  );
}

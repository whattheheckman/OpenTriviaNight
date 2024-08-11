import { useContext } from "react";
import { GameContext } from "../GameContext";
import { Button, Spinner, Table } from "flowbite-react";
import useApiClient from "../useApiClient";
import GameIdCopyButton from "./common/GameIdCopyButton";

export default function WaitingToStartScreen() {
  const { game, username } = useContext(GameContext);
  const apiClient = useApiClient();

  if (!game) {
    return <></>;
  }

  const isHost = game.players.find((x) => x.username === username)?.role === "Host";

  return (
    <div className="flex flex-col max-w-screen-md mx-auto items-stretch">
      <div className="text-center my-4">
        <Spinner />
      </div>
      <h1 className="text-lg font-semibold self-center mb-5">Waiting for Host to Start Game</h1>

      <Table>
        <Table.Head>
          <Table.HeadCell>Players</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {game.players.map((player) => (
            <Table.Row key={player.username}>
              <Table.Cell className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="text-lg">{player.username}</div>
                  <div className="text-sm text-gray-400">{player.role}</div>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}

          <Table.Row>
            <Table.Cell>
              <div className="inline-flex items-middle">
                <span className="py-2 pr-1">Use Game ID </span>
                <GameIdCopyButton className="text-gray-500 hover:bg-gray-100 active:bg-gray-200" />
                <span className="py-2 pl-1">to join</span>
              </div>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      {isHost ? (
        <Button className="mt-4" color="success" size="lg" onClick={apiClient.startGame}>
          Start Game
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
}

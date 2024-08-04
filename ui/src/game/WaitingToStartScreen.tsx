import { useContext } from "react";
import { GameContext } from "../GameContext";
import { Button, Spinner, Table } from "flowbite-react";
import useApiClient from "../useApiClient";
import { HiClipboard } from "react-icons/hi";

export function WaitingToStartScreen() {
    const { game, username, addError } = useContext(GameContext);
    const apiClient = useApiClient();

    if (!game) { return <></> }

    const isHost = game.players.find(x => x.username === username)?.role === "Host";

    const copyGameIdToClipboard = () => {
        navigator.clipboard.writeText(game.id).catch(_ => addError("Failed to copy Game ID to clipboard"))
    }

    return <div className="flex flex-col max-w-screen-md mx-auto items-stretch">
        <div className="text-center mt-5">
            <Spinner />
        </div>
        <h1 className="text-lg font-semibold self-center mb-5">Waiting for Host to Start Game</h1>

        <Table className="">
            <Table.Head>
                <Table.HeadCell>Players</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {game.players.map(player => (
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
                    <Table.Cell >
                        <div className="inline-flex items-stretch">
                            <span className="p-2">Use Game ID </span>
                            <button onClick={copyGameIdToClipboard} className="inline-flex gap-1 p-2 font-semibold italic rounded-lg text-gray-500 hover:bg-gray-100">
                                <span>{game.id}</span>
                                <span className="text-lg h-5"><HiClipboard /></span>
                            </button>
                            <span className="p-2">to join</span>
                        </div>
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>

        {isHost ? <Button className="mt-4" color="success" size="lg" onClick={apiClient.startGame}>Start Game</Button> : <></>}

    </div >
}
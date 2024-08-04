import { useContext } from "react";
import { GameContext } from "../GameContext";
import { Button, Spinner, Table } from "flowbite-react";
import useApiClient from "../useApiClient";

export function WaitingToStartScreen() {
    const { game, username } = useContext(GameContext);
    const apiClient = useApiClient();

    if (!game) { return <></> }

    const isHost = game.players.find(x => x.username === username)?.role === "Host";

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
                {game.players.map(player => {
                    return <Table.Row key={player.username}>
                        <Table.Cell className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <div className="text-lg">{player.username}</div>
                                <div className="text-sm text-gray-400">{player.role}</div>
                            </div>
                            {isHost && player.username !== username
                                ? <Button color="red">Remove</Button>
                                : <></>}
                        </Table.Cell>
                    </Table.Row>
                })}

                <Table.Row>
                    <Table.Cell>Use Game ID <span className="text-semibold italic">{game.id}</span> to join</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>

        {isHost ? <Button className="mt-4" color="success" size="lg" onClick={apiClient.startGame}>Start Game</Button> : <></>}

    </div>
}
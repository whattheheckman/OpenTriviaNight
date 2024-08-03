import { useContext } from "react";
import { GameContext } from "../GameContext";
import { Button, Table } from "flowbite-react";

export function WaitingToStartScreen() {
    const { game, username, signalR } = useContext(GameContext);

    if (!game) { return <></> }

    const isHost = game.players.find(x => x.username === username)?.role === "Host";

    const startGame = () => {
        signalR.invoke("StartGame");
    }

    return <div className="flex flex-col max-w-screen-md mx-auto items-center">
        <h1 className="text-lg font-semibold">Waiting For Game To Start</h1>

        <Table className="w-100 self-stretch grow ">
            <Table.Head>
                <Table.HeadCell>Players</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {game.players.map(player => {
                    return <Table.Row>
                        <Table.Cell className="flex justify-between w-100">
                            <div>{player.username}</div>
                            <div className="text-gray-400">{player.role}</div>
                            {isHost && player.username !== username
                                ? <Button color="red">Remove</Button>
                                : <></>}
                        </Table.Cell>
                    </Table.Row>
                })}
            </Table.Body>
        </Table>

        {isHost ? <Button className="mt-4" color="success" size="lg" onClick={startGame}>Start Game</Button> : <></>}

    </div>
}
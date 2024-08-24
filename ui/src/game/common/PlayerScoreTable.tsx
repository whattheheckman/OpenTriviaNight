import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Table } from "flowbite-react";

export default function PlayerScoreTable() {
  const { game } = useContext(GameContext);

  return (
    <Table striped className="drop-shadow-none">
      <Table.Head>
        <Table.HeadCell>Pos</Table.HeadCell>
        <Table.HeadCell>Player</Table.HeadCell>
        <Table.HeadCell>Score</Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {game?.players
          .filter((x) => x.role === "Contestant")
          .sort((a, b) => b.score - a.score)
          .map((p, i) => {
            return (
              <Table.Row key={i}>
                <Table.Cell className="py-1">{i + 1}</Table.Cell>
                <Table.Cell className="py-1">{p.username}</Table.Cell>
                <Table.Cell className="py-1">{p.score}</Table.Cell>
              </Table.Row>
            );
          })}
      </Table.Body>
    </Table>
  );
}

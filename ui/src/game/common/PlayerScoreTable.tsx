import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";

export default function PlayerScoreTable() {
  const { game } = useContext(GameContext);

  return (
    <Table striped className="drop-shadow-none">
      <TableHead>
        <TableHeadCell>Pos</TableHeadCell>
        <TableHeadCell>Player</TableHeadCell>
        <TableHeadCell>Score</TableHeadCell>
      </TableHead>
      <TableBody>
        {game?.players
          .filter((x) => x.role === "Contestant")
          .sort((a, b) => b.score - a.score)
          .map((p, i) => {
            return (
              <TableRow key={i}>
                <TableCell className="py-1">{i + 1}</TableCell>
                <TableCell className="py-1">{p.username}</TableCell>
                <TableCell className="py-1">{p.score}</TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}

import React, { useContext, useState } from "react";
import { GameContext } from "../../GameContext";
import { Button, Modal, ModalBody, ModalHeader, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { HiPencil } from "react-icons/hi";
import { Player } from "../../Models";
import LabeledTextInput from "../../LabeledTextInput";
import useApiClient from "../../useApiClient";

export default function PlayerScoreTable() {
  const { game, role, addError } = useContext(GameContext);
  const [editScorePlayer, setEditScorePlayer] = useState<Player | undefined>(undefined);
  const [newScore, setNewScore] = useState(0);
  const apiClient = useApiClient();

  const editScore = (player: Player) => {
    setEditScorePlayer(player);
    setNewScore(player.score);
  };

  const updateScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (editScorePlayer && newScore !== editScorePlayer.score) {
      apiClient.updatePlayerScore(editScorePlayer.username, newScore);
    } else {
      addError("Unable to update score");
    }
    setEditScorePlayer(undefined);
  };

  return (
    <Table striped className="drop-shadow-none">
      <TableHead>
        <TableRow>
          <TableHeadCell>Pos</TableHeadCell>
          <TableHeadCell>Player</TableHeadCell>
          <TableHeadCell>Score</TableHeadCell>
        </TableRow>
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
                <TableCell className="py-1 flex items-center justify-between">
                  {p.score}
                  {role == "Host" && (
                    <Button size="xs" className="mx-4" outline onClick={() => editScore(p)}>
                      <HiPencil className="h-5 mr-1" />
                      <span>Edit</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>

      <Modal show={editScorePlayer !== undefined} size="sm" dismissible onClose={() => setEditScorePlayer(undefined)}>
        <ModalHeader>
          <span>Update score for {editScorePlayer?.username ?? "unknown"}</span>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={updateScore}>
            <LabeledTextInput
              label="New Score"
              className="grow"
              placeholder="42"
              name="newScore"
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(Number(e.target.value))}
            />

            <div className="text-xs mt-1">Current Score: {editScorePlayer?.score}</div>

            <div className="flex justify-between mt-2">
              <Button type="button" color="red" outline onClick={() => setEditScorePlayer(undefined)}>
                Cancel
              </Button>

              <Button type="submit" color="green">
                Update
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </Table>
  );
}

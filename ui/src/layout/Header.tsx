import { useContext, useEffect, useState } from "react";
import { GameContext } from "../GameContext";
import { Modal, Popover } from "flowbite-react";
import HeaderModal from "./HeaderModal";
import GameIdCopyButton from "../game/common/GameIdCopyButton";
import useApiClient from "../useApiClient";
import { Stats } from "../Models";

export default function Header() {
  const { game } = useContext(GameContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({ gamesCount: 0, version: "" });
  const apiClient = useApiClient();

  useEffect(() => {
    apiClient.getStats()?.then((res) => {
      if (res) {
        setStats(res);
      }
    });
  }, [setStats]);

  useEffect(() => {
    if (game?.state.state === "WaitingToStart") {
      setHintOpen(true);
      setTimeout(() => setHintOpen(false), 5000);
    }
  }, [game?.state.state]);

  return (
    <>
      <Popover
        aria-labelledby="area-popover"
        open={hintOpen}
        onOpenChange={() => setHintOpen(false)}
        content={
          <div className="w-64 p-4 animate-pulse text-sm text-gray-500 bg-orange-100" onClick={() => setHintOpen(false)}>
            Tap the top bar to see other players scores, and manage the game.
          </div>
        }
      >
        <div className="flex justify-between md:justify-center px-4 md:px-6 h-14 w-100 items-center bg-orange-400 border-b-2 border-black">
          <button className="font-bold text-left md:text-center text-xl grow self-stretch" onClick={() => setModalOpen(true)}>
            Open Trivia Night
          </button>
          {game ? (
            <div className="md:absolute right-0 md:pr-4 z-10 inline-flex items-center">
              <span className="py-2 text-sm">Game ID: </span>
              <GameIdCopyButton className="hover:bg-orange-200 active:bg-orange-100" />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </Popover>

      <Modal show={modalOpen} dismissible onClose={() => setModalOpen(false)}>
        <Modal.Header>About</Modal.Header>
        <Modal.Body>
          <HeaderModal onLeaveGame={() => setModalOpen(false)} />
        </Modal.Body>
        <Modal.Footer className="justify-between text-xs text-gray-400">
          <span>
            Games: <em>{stats.gamesCount}</em>
          </span>
          <span>v{stats.version}</span>
        </Modal.Footer>
      </Modal>
    </>
  );
}

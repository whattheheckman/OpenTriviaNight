import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game } from "../../Models";
import { GameContext } from "../../GameContext";
import LabeledTextInput from "../../LabeledTextInput";
import CreateRound from "./CreateRound";
import UploadGameFromFile from "./UploadGameFromFile";
import { HiPlus, HiOutlineSave, HiOutlineUpload, HiPlay } from "react-icons/hi";
import useApiClient from "../../useApiClient";

export default function CreateGame() {
  const { setGame, setRole, setGameId, username, setUsername } = useContext(GameContext);
  const [loadGameModalOpen, setLoadGameModalOpen] = useState(false);
  const apiClient = useApiClient();
  const [request, setRequest] = useState<CreateGameRequest>({
    rounds: [[]],
  });

  const addRound = () => {
    setRequest((r) => {
      r.rounds.push([]);
      return { ...r };
    });
  };

  const saveGameToFile = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(request))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${username}-open-trivia-night-game.json`;

    link.click();
  };

  const loadGameFromFile = () => {
    setLoadGameModalOpen(true);
    return null;
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    apiClient.createGame(request)?.then((res: Game) => {
      setGame(res);
      setRole("Host");
      setGameId(res.id);
    });
  };

  const hasAnyQuestions = () => request.rounds.every(x => x.length === 0);

  return (
    <div>
      <Modal show={loadGameModalOpen} size="7xl" dismissible onClose={() => setLoadGameModalOpen(false)}>
        <ModalHeader>
          <span>Load Saved Questions from File</span>
        </ModalHeader>
        <ModalBody>
          <UploadGameFromFile
            onAdd={(newGameRequest) => {
              setRequest(newGameRequest);
              setLoadGameModalOpen(false);
            }}
          />
        </ModalBody>
      </Modal>

      <form onSubmit={handleCreateGame} className="gap-4 flex flex-col">
        <LabeledTextInput
          className="max-w-2xl"
          label="Your Name"
          name="username"
          type="text"
          placeholder="John"
          minLength={1}
          maxLength={20}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 self-center items-center justify-center">
          <Button onClick={loadGameFromFile} className="w-64" disabled={!hasAnyQuestions()}>
            <span className="mr-2 text-xl">
              <HiOutlineUpload />
            </span>
            <span>Upload Questions</span>
          </Button>

          <Button onClick={saveGameToFile} className="w-64" disabled={hasAnyQuestions()}>
            <span className="mr-2 text-xl">
              <HiOutlineSave />
            </span>
            <span>Download Questions</span>
          </Button>

          <Button type="submit" color="green" className="w-64">
            <span className="mr-2 text-xl">
              <HiPlay />
            </span>
            <span>Create Game</span>
          </Button>
        </div>
        {request.rounds.map((round, roundIdx) => {
          return <CreateRound key={roundIdx} round={round} roundNumber={roundIdx} setRequest={setRequest} />;
        })}
        <Button color="blue" onClick={addRound} className="w-sm mx-auto">
          <span className="mr-2 text-xl">
            <HiPlus />
          </span>
          <span>Add Round</span>
        </Button>

        <Button type="submit" size="xl" color="green" className="w-sm mx-auto">
          <span className="mr-2 text-xl">
            <HiPlay />
          </span>
          Create Game
        </Button>
      </form>
    </div>
  );
}

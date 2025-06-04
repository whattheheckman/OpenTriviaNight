import { Button, Modal } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game } from "../../Models";
import { GameContext } from "../../GameContext";
import LabeledTextInput from "../../LabeledTextInput";
import CreateRound from "./CreateRound";
import UploadGameFromFile from "./UploadGameFromFile";
import { HiPlus, HiOutlineSave, HiOutlineUpload } from "react-icons/hi";
import useApiClient from "../../useApiClient";

export default function CreateGame() {
  const { setGame, setRole, setGameId, username, setUsername } =
    useContext(GameContext);
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
    if (request.rounds.length <= 0) {
      console.log("not enough saved rounds");
      alert("No rounds to save to file");
      return;
    }
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(request)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = username + "-open-trivia-night-game.json";

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

  return (
    <div>
      <Modal
        show={loadGameModalOpen}
        size="7xl"
        dismissible
        onClose={() => setLoadGameModalOpen(false)}
      >
        <Modal.Header>
          <span>Load Saved Questions from File</span>
        </Modal.Header>
        <Modal.Body>
          <UploadGameFromFile
            onAdd={(newGameRequest) => {
              setRequest(newGameRequest);
              setLoadGameModalOpen(false);
            }}
          />
        </Modal.Body>
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
        <div className="flex gap-2 self-center items-center ">
          <Button onClick={loadGameFromFile}>
            <HiOutlineUpload fontSize="20 md:" className="mr-2" />
            Load Questions from File
          </Button>

          <Button onClick={saveGameToFile}>
            <HiOutlineSave fontSize="20" className="mr-2" />
            Save Questions to File
          </Button>
        </div>
        {request.rounds.map((round, roundIdx) => {
          return (
            <CreateRound
              key={roundIdx}
              round={round}
              roundNumber={roundIdx}
              setRequest={setRequest}
            />
          );
        })}
        <Button color="info" onClick={addRound} size="xm">
          <HiPlus className="h-5 mr-2" />
          Add Round
        </Button>
        
        <Button type="submit" size="xl" gradientDuoTone="purpleToBlue">
          Create Game
        </Button>
      </form>
    </div>
  );
}

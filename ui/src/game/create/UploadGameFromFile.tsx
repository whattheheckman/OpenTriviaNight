import {
  Button,
  FileInput,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { CreateGameRequest } from "../../Models";
import { useState } from "react";
import { HiCheck } from "react-icons/hi";

type Props = {
  onAdd: (newGameRequest: CreateGameRequest) => void;
};

export default function UploadGameFromFile({ onAdd }: Props) {
  const [fileName, setFileName] = useState<string>("");
  const [parsedGameRequest, setParsedGameRequest] = useState<CreateGameRequest | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        const gameData = JSON.parse(fileContent) as CreateGameRequest;

        // Validate the parsed data has the expected structure
        if (!gameData.rounds || !Array.isArray(gameData.rounds)) {
          throw new Error("Invalid game file format");
        }

        setParsedGameRequest(gameData);
      } catch (error) {
        console.error("Error parsing game file:", error);
        alert("Invalid game file format");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex w-full items-center justify-center">
        <Label
          htmlFor="dropzone-file"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <svg
              className="mb-4 h-8 w-8 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-gray-500">Only Open Trivia Night saved games are supported</p>
          </div>
          <FileInput id="dropzone-file" className="absolute top-0 left-0 bottom-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".json" />
        </Label>
      </div>

      {parsedGameRequest && (
        <div className="my-4">
          {parsedGameRequest.rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Round {roundIndex + 1}</h3>
              {round.map((category) => (
                <div key={category.categoryId} className="mb-4">
                  <h4 className="font-medium mb-2">{category.name}</h4>
                  <Table striped>
                    <TableHead>
                      <TableHeadCell>Question</TableHeadCell>
                      <TableHeadCell>Correct Answer</TableHeadCell>
                      <TableHeadCell>Value</TableHeadCell>
                    </TableHead>
                    <TableBody>
                      {category.questions.map((q) => (
                        <TableRow key={q.questionId}>
                          <TableCell>{q.detail}</TableCell>
                          <TableCell>{q.correctAnswer}</TableCell>
                          <TableCell>{q.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ))}

          <Button className="mt-4" type="button" color="green" onClick={() => onAdd(parsedGameRequest)}>
            <HiCheck className="h-5 mr-2" />
            Use these Questions
          </Button>

          <div className="text-xs mt-4 text-gray-400">
            <span>Loaded questions from {fileName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

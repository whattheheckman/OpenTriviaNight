import { Button, Label, Table, FileInput } from "flowbite-react";
import { CreateGameRequest, Question } from "../../Models";
import { useState } from "react";
import { HiCheck } from "react-icons/hi";

type Props = {
  onAdd: (loadedGame: CreateGameRequest) => void;
}

export default function UploadGameFromFile({ onAdd }: Props) {
  const [uploadedGame, setUploadedGame] = useState()
  const [tentativeCreateGameRequest, setTentativeCreateGameRequest] = useState<CreateGameRequest>({
    rounds: [[]],
  });

  

  const finalize = () => onAdd(uploadedGame);

  return (
    <div>
      <div className="flex w-full items-center justify-center">
      <Label
        htmlFor="dropzone-file"
        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg
            className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
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
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
        </div>
        <FileInput id="dropzone-file" className="hidden" />
      </Label>
    </div>
      

      {tentativeCreateGameRequest?.rounds.length > 0 ? (
  <div className="my-4">
    {tentativeCreateGameRequest.rounds.map((round, roundIndex) => (
      <div key={roundIndex} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Round {roundIndex + 1}</h3>
        {round.map((category) => (
          <div key={category.categoryId} className="mb-4">
            <h4 className="font-medium mb-2">{category.name}</h4>
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Question</Table.HeadCell>
                <Table.HeadCell>Correct Answer</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {category.questions.map((q) => (
                  <Table.Row key={q.questionId}>
                    <Table.Cell className="py-2">{q.detail}</Table.Cell>
                    <Table.Cell className="py-2">{q.correctAnswer}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        ))}
      </div>
    ))}
  </div>
) : (
  <></>
)}

      {tentativeCreateGameRequest?.rounds.length > 0
        ? <Button className="mt-4" type="button" color="success" onClick={finalize}><HiCheck className="h-5 mr-2" />Use these Questions</Button>
        : <></>}

      <div className="text-xs mt-4 text-base leading-relaxed text-gray-400">
        <span>
          Loaded questions from file.
        </span>
      </div>
    </div>
  )
}
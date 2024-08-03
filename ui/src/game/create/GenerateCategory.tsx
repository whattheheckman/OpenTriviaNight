import { Question } from "../../Models";
import GenerateFromOpenTDB from "./GenerateFromOpenTDB";

type Props = {
  onAdd: (category: string, questions: Question[]) => void;
}

export default function GenerateCategory({ onAdd }: Props) {
  return (
    <div>
      <h2 className="font-semibold">Generation Source</h2>
      <GenerateFromOpenTDB onAdd={onAdd} />

      <div className="text-xs mt-4 text-base leading-relaxed text-gray-400">
        <span>
          These questions are generated using the <a className="hover:underline text-sky-400" href="https://opentdb.com" target="_blank" rel="noopener noreferrer">Open Trivia Database</a> and <a className="hover:underline text-sky-400" href="https://the-trivia-api.com" target="_blank" rel="noopener noreferrer">The Trivia API</a>. Huge thanks to these two services for provided an amazing source of questions.
        </span>
      </div>
    </div>
  )
}
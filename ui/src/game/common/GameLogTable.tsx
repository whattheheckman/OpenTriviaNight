import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { GameLog } from "../../Models";
import { GameHelper } from "../../GameHelper";

export default function GameLogTable() {
  const { game } = useContext(GameContext);

  const getMessage = (log: GameLog) => {
    switch (log.type) {
      case "GameCreated":
        return `Game Created`;
      case "GameStarted":
        return `Game Started`;
      case "QuestionPicked":
        return `Question ${GameHelper.getQuestionTag(game!, log.questionId)} picked`;
      case "PlayerBuzzedIn":
        return `${log.username} buzzed in`;
      case "AnswerConfirmed":
        return log.isCorrect
          ? `${log.username} answered correctly and has been awarded ${log.pointsChange} points (Answer: "${
              GameHelper.getQuestionById(game!, log.questionId).question.correctAnswer
            }")`
          : `${log.username} answered incorrectly and lost ${log.pointsChange} points`;
      case "QuestionPassed":
        return `Question ${GameHelper.getQuestionTag(game!, log.questionId)} passed (Answer: "${
          GameHelper.getQuestionById(game!, log.questionId).question.correctAnswer
        }")`;
      case "ManualScoreUpdated":
        return `Score for ${log.username} updated from ${log.oldScore} to ${log.newScore}`;
    }
  };

  return (
    <Table striped className="drop-shadow-none">
      <TableHead>
        <TableHeadCell>Time</TableHeadCell>
        <TableHeadCell>Message</TableHeadCell>
      </TableHead>
      <TableBody>
        {game?.log.map((log, i) => {
          const time = new Date(log.time);
          return (
            <TableRow key={i}>
              <TableCell className="py-1">{time.toLocaleTimeString(undefined, { timeStyle: "medium" })}</TableCell>
              <TableCell className="py-1">{getMessage(log)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

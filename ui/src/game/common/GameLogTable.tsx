import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Table } from "flowbite-react";
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
          ? `${log.username} answered correctly and has been awarded ${log.pointsChange} points`
          : `${log.username} answered incorrectly and lost ${log.pointsChange} points`;
      case "QuestionPassed":
        return `Question was passed`;
    }
  };

  return (
    <Table striped>
      <Table.Head>
        <Table.HeadCell>Time</Table.HeadCell>
        <Table.HeadCell>Message</Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {game?.log.map((log, i) => {
          const time = new Date(log.time * 1000);
          return (
            <Table.Row key={i}>
              <Table.Cell className="py-1">{time.toLocaleTimeString(undefined, { timeStyle: "medium" })}</Table.Cell>
              <Table.Cell className="py-1">{getMessage(log)}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

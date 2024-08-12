import { useContext } from "react";
import { GameContext } from "../../GameContext";
import HostViewQuestion from "./HostViewQuestion";
import QuestionBoard from "../common/QuestionBoard";
import useApiClient from "../../useApiClient";

export default function HostScreen() {
  const { game } = useContext(GameContext);
  const apiClient = useApiClient();

  if (!game) {
    return <></>;
  }

  const pickQuestion = (questionId: string) => {
    apiClient.pickQuestion(questionId);
  };

  switch (game.state.state) {
    case "PickAQuestion":
      return <QuestionBoard onQuestionClick={pickQuestion} />;
    default:
      return <HostViewQuestion />;
  }
}

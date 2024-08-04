import { useContext } from "react";
import { GameContext } from "../GameContext";
import CreateJoinGame from "./create/CreateJoinGame";
import { WaitingToStartScreen } from "./WaitingToStartScreen";
import HostScreen from "./host/HostScreen";
import ContestantScreen from "./contestant/ContestantScreen";
import { Question } from "../Models";

export default function GameScreen() {
  const { game, setGame, username, signalR } = useContext(GameContext);

  signalR.useSignalREffect(
    "game-update",
    (update) => {
      setGame(g => {
        if (g) {
          return { ...g, ...update }
        }
      })
    },
    [setGame]
  );

  signalR.useSignalREffect(
    "question-update",
    (update: Question) => {
      setGame(g => {
        if (!g) {
          return g;
        }
        let [category, questions] = Object.entries(g.rounds[g.currentRound]).find(([_, questions]) => questions.find(q => q.questionId === update.questionId))!;
        let questionIndex = questions.findIndex(x => x.questionId == update.questionId);

        g.rounds[g.currentRound][category][questionIndex] = update;
        return {...g}
      })
    },
    [setGame]
  );

  if (game === undefined) { return <CreateJoinGame /> }

  if (game.state.state === "WaitingToStart") return <WaitingToStartScreen />

  const role = game.players.find(x => x.username === username)?.role ?? "Spectator"

  switch (role) {
    case "Host": return <HostScreen />;
    case "Contestant": return <ContestantScreen />;
  }
}
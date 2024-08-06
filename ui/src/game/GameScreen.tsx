import { useContext } from "react";
import { GameContext } from "../GameContext";
import CreateJoinGame from "./create/CreateJoinGame";
import { WaitingToStartScreen } from "./WaitingToStartScreen";
import HostScreen from "./host/HostScreen";
import ContestantScreen from "./contestant/ContestantScreen";
import { Question } from "../Models";
import GameFinishedScreen from "./GameFinishedScreen";

export default function GameScreen() {
  const { game, setGame, username, signalR, addError } = useContext(GameContext);

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
        let categoryIndex = g.rounds[g.currentRound].findIndex(category => category.questions.find(q => q.questionId === update.questionId));
        let questionIndex = g.rounds[g.currentRound][categoryIndex].questions.findIndex(x => x.questionId == update.questionId);
        g.rounds[g.currentRound][categoryIndex].questions[questionIndex] = update;
        return { ...g }
      })
    },
    [setGame]
  );

  signalR.connection?.onclose(error => {
    setGame(undefined);
    console.warn("Client has been disconnected for reason: ", error)
    addError(`Client has been disconnected for reason: ${error?.name ?? "Unknown"} ${error?.message ?? ""}`)
  })

  if (game === undefined) { return <CreateJoinGame /> }

  if (game.state.state === "WaitingToStart") return <WaitingToStartScreen />
  if (game.state.state === "Finished") return <GameFinishedScreen />

  const role = game.players.find(x => x.username === username)?.role ?? "Spectator"

  switch (role) {
    case "Host": return <HostScreen />;
    case "Contestant": return <ContestantScreen />;
  }
}
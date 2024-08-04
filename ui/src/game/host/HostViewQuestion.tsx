import { useContext, useState } from "react";
import { GameContext } from "../../GameContext";
import { Button, Spinner } from "flowbite-react";
import { Player } from "../../Models";

export default function HostViewQuestion() {
    const { game, signalR } = useContext(GameContext);
    const [reveal, setReveal] = useState(false);

    if (!game || !("question" in game.state)) { return <></> }

    let question = game.state.question
    let [category] = Object.entries(game.rounds[game.currentRound]).find(([_, q]) => q.find(x => x.questionId == question.questionId)) ?? ["Unknown Category"]

    const markFinishedReading = () => {
        signalR.invoke("AllowAnswering")
    }

    const confirmAnswer = (isCorrect: boolean) => {
        signalR.invoke("ConfirmAnswer", isCorrect)
        setReveal(false)
    }

    const endQuestion = () => {
        signalR.invoke("EndQuestion")
        setReveal(false)
    }

    const readQuestionBar = <div>
        <Button onClick={() => markFinishedReading()}>Finished Reading</Button>
    </div>

    const waitingForAnswer = <div className="flex flex-col items-center gap-4">
        <Spinner />
        <span>Waiting for an Answer...</span>
        {reveal
            ? <span onClick={() => setReveal(false)}>The correct answer is: <span className="font-bold">{question.correctAnswer}</span></span>
            : <Button onClick={() => setReveal(true)}>Reveal Answer</Button>}
        <Button color="red" outline onClick={endQuestion}>End Question Without Answer</Button>
    </div>

    const checkAnswer = (player: Player) => {
        return <div className="flex flex-col gap-4 items-stretch text-center">
            <span className="text-lg">{player.username} has buzzed in!</span>
            <span className="my-4">The correct answer is: <span className="font-bold">{question.correctAnswer}</span></span>
            <Button color="success" onClick={() => confirmAnswer(true)}>Correct!</Button>
            <Button color="warning" onClick={() => confirmAnswer(false)}>Incorrect</Button>
        </div>
    }

    let bottomBar = <></>
    switch (game.state.state) {
        case "ReadQuestion": bottomBar = readQuestionBar; break;
        case "WaitingForAnswer": bottomBar = waitingForAnswer; break;
        case "CheckAnswer": bottomBar = checkAnswer(game.state.player); break;
    }

    return <div className="flex flex-col grow bg-orange-400 w-100 m-4 rounded-xl">
        <div className="flex flex-col items-center justify-between p-4 grow">
            <div className="text-lg">
                <span>{category} - {question.value}</span>
            </div>
            <div className="text-4xl">
                <span>{question.detail}</span>
            </div>

            <div>
                {bottomBar}
            </div>
        </div>
    </div>
}
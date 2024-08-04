import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { Button, Spinner } from "flowbite-react";

function Wrapper({children}: React.PropsWithChildren) {
    return (
        <div className="flex flex-col items-center gap-16 justify-between grow m-16 text-center">
            {children}
        </div>
    )
}

export default function ContestantScreen() {
    const { game, username, signalR } = useContext(GameContext);

    if (!game) return <></>

    const player = game.players.find(x => x.username == username)
    if (!player) return <></>

    const answerQuestion = () => {
        signalR.invoke("AnswerQuestion")
    }

    const header = <div className="flex flex-col items-center gap-2">
        <span className="text-4xl font-light">{player.username}</span>
        <span className="text-2xl font-bold">{player.score}</span>
    </div>

    const footer = <div className="mb-8">
        <Button size="xl" gradientMonochrome="failure" className="flex items-center text-lg p-4 rounded-full aspect-square" disabled={game.state.state !== "WaitingForAnswer"} onClick={answerQuestion}>Answer</Button>
    </div>

    switch (game.state.state) {
        case "PickAQuestion": return (
            <Wrapper>
                {header}
                <Spinner size="xl" className="my-2" />
                <span>Waiting for Host to pick a question</span>
            </Wrapper>
        )
        case "ReadQuestion": return (
            <Wrapper>
                {header}
                <span>Host is reading the question</span>
                {footer}
            </Wrapper>
        )
        case "WaitingForAnswer": return (
            <Wrapper>
                {header}
                <span>{game.state.question.detail}</span>
                {footer}
            </Wrapper>
        )
        case "CheckAnswer": return (
            <Wrapper>
                {header}
                {game.state.player.username === username
                    ? <span>Host is checking your answer...</span>
                    : <span>{game.state.player.username} has answered</span>
                }
                {footer}
            </Wrapper>
        )
    }
}
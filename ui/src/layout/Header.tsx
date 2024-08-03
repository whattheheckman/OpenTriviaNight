import { useContext } from "react";
import { GameContext } from "../GameContext";

export default function Header() {
    const { game } = useContext(GameContext);

    return (
        <div className="flex justify-between md:justify-center px-4 md:px-6 h-14 w-100 items-center bg-orange-400 border-b-2 border-black">
            <span className="font-bold text-xl shrink">Open Trivia Night</span>
            {game
                ? <div className="md:absolute right-0 md:pr-4">
                    <span>Game ID: </span>
                    <span className="font-semibold italic">{game.id}</span>
                </div>
                : <div></div>}

        </div>
    )
}
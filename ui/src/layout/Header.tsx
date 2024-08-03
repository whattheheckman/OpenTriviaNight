import { useContext } from "react";
import { GameContext } from "../GameContext";

export default function Header() {
    const { game } = useContext(GameContext);

    return (
        <div className="grid grid-cols-3 px-2 h-14 w-100 content-center items-center bg-orange-400 border-b-2 border-black">
            <span></span>
            <span className="flex justify-center font-bold text-xl">Open Trivia Night</span>
            <span className="flex justify-end font-semibold">{game ? `Game ID: ${game.id}` : ""}</span>
        </div>
    )
}
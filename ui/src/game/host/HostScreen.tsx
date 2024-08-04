import { useContext } from "react";
import { GameContext } from "../../GameContext";
import HostPickAQuestion from "./HostPickAQuestion";
import HostViewQuestion from "./HostViewQuestion";

export default function HostScreen() {
    const { game } = useContext(GameContext);

    if (!game) { return <></> }

    switch (game.state.state) {
        case "PickAQuestion": return <HostPickAQuestion />
        default: return <HostViewQuestion />
    }
}
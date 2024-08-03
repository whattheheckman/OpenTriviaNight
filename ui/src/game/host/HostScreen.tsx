import { useContext } from "react";
import { GameContext } from "../../GameContext";
import HostPickAQuestion from "./HostPickAQuestion";

export default function HostScreen() {
    const { game, signalR } = useContext(GameContext);

    if (!game) { return <></> }
    console.log(game.state.state)
    switch (game.state.state) {
        case "PickAQuestion": return <HostPickAQuestion />
    }

}
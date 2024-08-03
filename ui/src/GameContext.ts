import { createContext, Dispatch, SetStateAction } from "react";
import { Game } from "./Models";
import { Context, Hub } from "react-signalr/lib/signalr/types";

export const GameContext = createContext<{
    game: Game | undefined,
    setGame: Dispatch<SetStateAction<Game | undefined>>,
    username: string,
    setUsername: Dispatch<SetStateAction<string>>,
    signalR: Context<Hub<string, string>>
}>({
    game: undefined,
    setGame: () => { },
    username: "",
    setUsername: () => { },
    signalR: {} as Context<Hub<string, string>>
})

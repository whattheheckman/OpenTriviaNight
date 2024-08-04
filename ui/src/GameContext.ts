import { createContext, Dispatch, SetStateAction } from "react";
import { Game } from "./Models";
import { Context, Hub } from "react-signalr/lib/signalr/types";

export type Errors = { [key: string]: string };

export const GameContext = createContext<{
  game: Game | undefined,
  setGame: Dispatch<SetStateAction<Game | undefined>>,
  username: string,
  setUsername: Dispatch<SetStateAction<string>>,
  errors: Errors,
  addError: (error: string) => void,
  signalR: Context<Hub<string, string>>
}>({
  game: undefined,
  setGame: () => { },
  username: "",
  setUsername: () => { },
  errors: {},
  addError: (_) => { },
  signalR: {} as Context<Hub<string, string>>,
})

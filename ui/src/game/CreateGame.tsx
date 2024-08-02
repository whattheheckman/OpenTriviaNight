import { Button, Label, TextInput } from "flowbite-react";
import { useContext, useState } from "react";
import { CreateGameRequest, Game } from "../Models";
import { GameContext } from "../GameContext";

export default function CreateGame() {
  const { game, setGame, signalR } = useContext(GameContext);
  const [request, setRequest] = useState<CreateGameRequest>({
    username: "",
    rounds: []
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // TODO: Handle question data
    setRequest({ ...request, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signalR
      .invoke("CreateGame", request)
      ?.then((res: Game) => {
        setGame(res);
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label value="Nickname" />
      <TextInput id="username" type="text" required name="username" value={request.username} onChange={handleUsernameChange} />

      {request.rounds.map((round, idx) => {
        return (
          <div></div>
        )
      })}

      <Button>Add Round</Button>

      <Button type="submit">Create</Button>
    </form>
  )
}
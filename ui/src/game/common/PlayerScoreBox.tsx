import { Player } from "../../Models";

export default function PlayerScoreBox({ player }: { player: Player }) {
  return (
    <div className="flex flex-col min-w-48 grow flex-1 mx-2 gap-2 p-2 bg-gray-300 text-black rounded-lg items-center text-center">
      <span className="text-xl">{player.username}</span>
      <span className="text-2xl font-bold">{player.score}</span>
    </div>
  );
}

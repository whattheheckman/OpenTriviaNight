import { Player } from "../../Models";

export default function PlayerScoreBox({
  player,
  highlight,
  rounded,
}: {
  player: Player;
  highlight?: boolean | undefined;
  rounded?: boolean | undefined;
}) {
  const roundedClasses = rounded ? "rounded-lg mx-2" : "drop-shadow-md";
  const highlightClasses = highlight ? "bg-orange-300" : "bg-gray-300";

  return (
    <div
      className={`flex flex-col justify-between min-w-40 grow flex-1 gap-1 p-2 ${highlightClasses} text-black items-center text-center ${roundedClasses}`}
    >
      <span className="text-md md:text-xl">{player.username}</span>
      <span className="text-lg md:text-2xl font-bold">{player.score}</span>
    </div>
  );
}

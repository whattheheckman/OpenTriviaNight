import { useContext } from "react";
import { GameContext } from "../../GameContext";
import { HiClipboard } from "react-icons/hi2";

export default function GameIdCopyButton({ className }: { className?: string | undefined }) {
  const { game, addError, prefs } = useContext(GameContext);

  if (!game) {
    return <></>;
  }

  const copyGameIdToClipboard = () => {
    navigator.clipboard.writeText(game.id).catch(() => addError("Failed to copy Game ID to clipboard"));
  };

  return (
    <button onClick={copyGameIdToClipboard} className={`inline-flex text-sm gap-1 p-2 font-semibold rounded-lg ${className}`}>
      <span className="font-mono">{prefs.hideGameId ? "****" : game.id}</span>
      <HiClipboard className="h-5" />
    </button>
  );
}

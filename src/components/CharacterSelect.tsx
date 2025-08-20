import { type Character } from '../data/battleData.ts';

type Props = {
  characters: Record<string, Character>;
  playerChoiceId: string;
  opponentChoiceId: string;
  onChangePlayer: (id: string) => void;
  onChangeOpponent: (id: string) => void;
  onStartBattle: () => void;
};

const CharacterSelect = ({
  characters,
  playerChoiceId,
  opponentChoiceId,
  onChangePlayer,
  onChangeOpponent,
  onStartBattle,
}: Props) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-4 pt-6">
      <div className="pb-12 text-center text-xl font-bold">
        Choose Your Fighters
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-start gap-4">
          <div className="text-sm font-medium">Your Character</div>
          <select
            className="move-button max-w-56 min-w-48 text-sm"
            value={playerChoiceId}
            onChange={(e) => onChangePlayer(e.target.value)}
          >
            {Object.entries(characters).map(([id, ch]) => (
              <option key={id} value={id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-end gap-4 pt-32">
          <div className="text-sm font-medium">Opponent</div>
          <select
            className="move-button max-w-56 min-w-48 text-sm"
            value={opponentChoiceId}
            onChange={(e) => onChangeOpponent(e.target.value)}
          >
            {Object.entries(characters).map(([id, ch]) => (
              <option key={id} value={id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-center pt-10">
        <button onClick={onStartBattle} className="move-button text-xl">
          Start Battle
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;

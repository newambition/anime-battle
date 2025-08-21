import { CHARACTERS } from '../data/battleData.ts';
import useBattleStore from '../store/battleStore.ts';

const CharacterSelect = () => {
  const {
    playerChoiceId,
    opponentChoiceId,
    setPlayerChoice,
    setOpponentChoice,
    startBattle,
  } = useBattleStore();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-4 pt-6">
      <div className="mangat-bold mt-4 text-center text-2xl leading-loose tracking-tight">
        {'{ '}Choose Your{' }'} <br /> {'{ '}Fighters{' }'}
      </div>
      <img src="src/assets/MenuImage.png" alt="Characters" className="w-full" />
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-md text-center font-medium">Your Character</div>
          <select
            className="move-button-user max-w-56 min-w-48 text-sm"
            value={playerChoiceId}
            onChange={(e) => setPlayerChoice(e.target.value)}
          >
            {Object.entries(CHARACTERS).map(([id, ch]) => (
              <option key={id} value={id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="text-md text-center font-medium">Opponent</div>
          <select
            className="move-button-opponent max-w-56 min-w-48 text-sm"
            value={opponentChoiceId}
            onChange={(e) => setOpponentChoice(e.target.value)}
          >
            {Object.entries(CHARACTERS).map(([id, ch]) => (
              <option key={id} value={id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-center pt-10">
        <div className="relative inline-block">
          <button
            onClick={startBattle}
            className="menu-button mangat-bold text-xl"
          >
            Start Battle...
          </button>
          <img
            src="src/assets/winkHeart.svg"
            alt="Wink Heart"
            className="pointer-events-none absolute -top-4 -left-3 w-10 -rotate-12 select-none"
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterSelect;
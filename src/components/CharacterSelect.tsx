import { CHARACTERS } from '../data/battleData.ts';
import useBattleStore from '../store/battleStore.ts';
import CharacterCard from './CharacterCard.tsx';

const CharacterSelect = () => {
  const {
    playerChoiceId,
    opponentChoiceId,
    setPlayerChoice,
    setOpponentChoice,
    startBattle,
  } = useBattleStore();

  const handleSelect = (id: string) => {
    if (playerChoiceId === id) {
      setPlayerChoice('');
      return;
    }
    if (opponentChoiceId === id) {
      setOpponentChoice('');
      return;
    }
    if (playerChoiceId === '') {
      setPlayerChoice(id);
      return;
    }
    if (opponentChoiceId === '') {
      if (playerChoiceId !== id) {
        setOpponentChoice(id);
      }
      return;
    }
  };

  const getSelectionType = (id: string) => {
    if (playerChoiceId === id) {
      return 'player';
    }
    if (opponentChoiceId === id) {
      return 'opponent';
    }
    return null;
  };

  return (
    <div className="bg-gradient flex h-screen flex-col items-center justify-center p-6">
      <h1 className="font-pixel mt-4 mb-4 text-center text-2xl font-bold tracking-wider text-white">
        Choose Your Fighter
      </h1>
      <div className="grid max-w-4xl grid-cols-3 gap-3 overflow-y-auto p-1 md:grid-cols-4">
        {Object.entries(CHARACTERS).map(([id, character]) => (
          <CharacterCard
            key={id}
            name={character.name}
            sprite={character.sprite}
            selectionType={getSelectionType(id)}
            onClick={() => handleSelect(id)}
          />
        ))}
      </div>
      <div className="w-full max-w-4xl">
        <div className="my-4 flex w-full gap-4">
          <div className="flex-1 rounded-2xl bg-[#4ADE80] px-6 py-3 text-center font-semibold text-white">
            {playerChoiceId
              ? `Player: ${CHARACTERS[playerChoiceId].name}`
              : 'Player'}
          </div>
          <div className="flex-1 rounded-2xl bg-[#F87170] px-6 py-3 text-center font-semibold text-white">
            {opponentChoiceId
              ? `Opponent: ${CHARACTERS[opponentChoiceId]?.name}`
              : 'Opponent'}
          </div>
        </div>
        <button
          className="font-pixel w-full cursor-pointer rounded-2xl bg-white px-8 py-4 text-2xl font-bold text-gray-800 transition-colors hover:bg-gray-100"
          onClick={startBattle}
          disabled={!playerChoiceId || !opponentChoiceId}
        >
          Battle!
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;

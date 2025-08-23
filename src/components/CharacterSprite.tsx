import type { BattleCharacter } from '../engine/battleTypes.ts';

type Props = {
  character: BattleCharacter;
  isPlayer: boolean;
};

const CharacterSprite = ({ character, isPlayer }: Props) => {
  const spritePath = character.sprite;
  return (
    <div className={`flex flex-col ${isPlayer ? 'items-start' : 'items-end'}`}>
      <img
        src={spritePath}
        alt={character.name}
        className="h-48 w-48 object-contain"
      />
    </div>
  );
};

export default CharacterSprite;

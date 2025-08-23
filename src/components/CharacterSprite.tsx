import useBattleStore from '../store/battleStore';
import type { BattleCharacter } from '../engine/battleTypes.ts';

type Props = {
  character: BattleCharacter;
  isPlayer: boolean;
};

const CharacterSprite = ({ character, isPlayer }: Props) => {
  const spritePath = character.sprite;
  const animation = useBattleStore(state => isPlayer ? state.playerAnimation : state.opponentAnimation);

  const animationClass = () => {
    switch (animation) {
      case 'shake':
        return 'animate-shake';
      case 'glow':
        return 'animate-glow';
      default:
        return '';
    }
  };

  return (
    <div className={`flex flex-col ${isPlayer ? 'items-start' : 'items-end'}`}>
      <img
        src={spritePath}
        alt={character.name}
        className={`h-48 w-48 object-contain ${animationClass()}`}
      />
    </div>
  );
};

export default CharacterSprite;
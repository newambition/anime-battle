const CharacterSprite = ({
  character,
  isPlayer,
}: {
  character: any;
  isPlayer: boolean;
}) => (
  <div
    className={`flex flex-col items-center ${isPlayer ? 'items-start' : 'items-end'}`}
  >
    <div className="sprite-placeholder">
      {typeof character.sprite === 'string' && character.sprite.length <= 4 ? (
        character.sprite
      ) : (
        <img
          src={character.sprite}
          alt={character.name}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  </div>
);

export default CharacterSprite;

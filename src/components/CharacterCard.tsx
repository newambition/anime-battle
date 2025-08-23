import React from 'react';

interface CharacterCardProps {
  name: string;
  sprite: string;
  selectionType: 'player' | 'opponent' | null;
  onClick: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  sprite,
  selectionType,
  onClick,
}) => {
  const getBorderColor = () => {
    if (selectionType === 'player') {
      return 'border-green-400';
    }
    if (selectionType === 'opponent') {
      return 'border-red-400';
    }
    return 'border-transparent';
  };

  return (
    <div
      className={`cursor-pointer rounded-2xl border-4 bg-white p-3 text-center transition-transform hover:scale-105 ${getBorderColor()} shadow-lg`}
      onClick={onClick}
    >
      <img src={sprite} alt={name} className="mx-auto h-16 w-16" />
      <p className="mt-2 font-semibold">{name}</p>
    </div>
  );
};

export default CharacterCard;

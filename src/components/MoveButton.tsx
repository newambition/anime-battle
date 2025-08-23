import React from 'react';

interface MoveButtonProps {
  name: string;
  icon: string;
  color: string;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
}

const MoveButton: React.FC<MoveButtonProps> = ({
  name,
  icon,
  color,
  disabled,
  selected,
  onClick,
}) => {
  return (
    <button
      className={`${color} flex items-center justify-center gap-4 rounded-2xl px-4 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        selected ? 'ring-4 ring-white' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="-mr-2 text-3xl">{icon}</span>
      <span className="text-md text-center">{name}</span>
    </button>
  );
};

export default MoveButton;

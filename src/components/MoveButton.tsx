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
      className={`${color} flex items-center justify-center gap-4 rounded-2xl border-2 border-blue-300 px-4 py-4 font-bold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        selected ? 'ring-4 ring-blue-400' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="-mr-2 text-2xl">{icon}</span>
      <span className="text-center text-sm">{name}</span>
    </button>
  );
};

export default MoveButton;

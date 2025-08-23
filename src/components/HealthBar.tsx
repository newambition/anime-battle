interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  name: string;
  level: number;
  stats?: string;
}

const HealthBar: React.FC<HealthBarProps> = ({
  currentHp,
  maxHp,
  name,
  level,
  stats,
}) => {
  const healthPercentage = (currentHp / maxHp) * 100;

  return (
    <div className="w-full rounded-2xl bg-white/80 p-2 shadow-lg">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-bold text-black">{name}</span>
        <span className="font-pixel text-xs text-black">Lv{level}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-300">
        <div
          className="h-3 rounded-full bg-green-500"
          style={{ width: `${healthPercentage}%` }}
        ></div>
      </div>
      {stats && (
        <div className="font-pixel mt-2 text-right text-xs font-bold text-black">
          {stats}
        </div>
      )}
    </div>
  );
};

export default HealthBar;

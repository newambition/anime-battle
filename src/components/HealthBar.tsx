import useBattleStore from '../store/battleStore';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  name: string;

  stats?: string;
  isPlayer: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({
  currentHp,
  maxHp,
  name,
  stats,
  isPlayer,
}) => {
  const healthPercentage = (currentHp / maxHp) * 100;
  const healthFlash = useBattleStore((state) =>
    isPlayer ? state.playerHealthFlash : state.opponentHealthFlash
  );

  return (
    <div className="glass-battle w-full rounded-2xl border border-white/10 p-2 shadow-lg">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-bold text-black">{name}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-300">
        <div
          role="progressbar"
          aria-valuenow={healthPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`h-3 rounded-full bg-green-500 ${healthFlash ? 'animate-health-flash' : ''}`}
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

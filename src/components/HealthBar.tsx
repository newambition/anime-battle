const HealthBar = ({
  currentHp,
  maxHp,
  name,
  level = 5,
  variant = 'bl',
}: {
  currentHp: number;
  maxHp: number;
  name: string;
  level?: number;
  variant?: 'bl' | 'br';
}) => {
  const healthPercentage = (currentHp / maxHp) * 100;
  const containerClassName = `${variant === 'br' ? 'battle-box-br' : 'battle-box-bl'} w-full`;
  return (
    <div className={containerClassName}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm">{name}</span>
        <span className="text-sm">Lv{level}</span>
      </div>
      <div className="health-bar-bg">
        <div
          className="health-bar"
          style={{
            width: `${healthPercentage}%`,
            backgroundColor: healthPercentage < 25 ? '#FF4500' : '#32CD32',
          }}
        ></div>
      </div>
      <div className="mt-1 text-right text-sm font-bold">
        {currentHp} / {maxHp}
      </div>
    </div>
  );
};

export default HealthBar;

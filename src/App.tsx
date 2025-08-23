import HealthBar from './components/HealthBar.tsx';
import BattleLog from './components/BattleLog.tsx';
import CharacterSprite from './components/CharacterSprite.tsx';
import CharacterSelect from './components/CharacterSelect.tsx';
import useBattleStore from './store/battleStore.ts';
import HomeButton from './components/HomeButton.tsx';
import MoveButton from './components/MoveButton.tsx';

function App() {
  const { gameState, player, opponent, battleLog, handleMove, restart } =
    useBattleStore();

  if (gameState === 'selecting') {
    return <CharacterSelect />;
  }

  return (
    <div className="flex h-screen flex-col p-4 text-white">
      <div onClick={restart}>
        <HomeButton />
      </div>

      {/* Opponent Section */}
      {opponent && (
        <div className="mt-6 flex items-center justify-between">
          <HealthBar
            name={opponent.name}
            currentHp={opponent.hp}
            maxHp={opponent.maxHp}
            level={5}
            stats={`${opponent.hp}/${opponent.maxHp}`}
            isPlayer={false}
          />
          <CharacterSprite character={opponent} isPlayer={false} />
        </div>
      )}

      {/*VS Card*/}
      <div className="mx-auto mt-6 w-fit transform rounded-2xl bg-white/80 px-2 py-2 text-center text-black shadow-lg">
        <h1 className="font-pixel text-md font-bold">⚔️ VS ⚔️</h1>
      </div>

      {/* Player Section */}
      {player && (
        <div className="mt-auto flex items-center justify-between">
          <CharacterSprite character={player} isPlayer={true} />
          <HealthBar
            name={player.name}
            currentHp={player.hp}
            maxHp={player.maxHp}
            level={5}
            stats={`${player.hp}/${player.maxHp}`}
            isPlayer={true}
          />
        </div>
      )}

      {/* Battle Log */}
      <div className="mb-6 rounded-2xl bg-white/80 p-4 text-black shadow-lg">
        <BattleLog messages={battleLog} />
      </div>

      {/* Move Buttons */}
      <div className="mb-2 grid grid-cols-2 gap-3">
        {gameState === 'game_over' ? (
          <button
            onClick={restart}
            className="col-span-2 rounded-2xl bg-blue-500 px-4 py-2 font-bold text-white shadow-lg"
          >
            Restart
          </button>
        ) : (
          player?.moves.map((move) => (
            <MoveButton
              key={move.id}
              name={move.name}
              icon={move.emoji || ''}
              color={
                gameState === 'player_turn' ? 'bg-blue-500' : 'bg-gray-500'
              }
              disabled={gameState !== 'player_turn'}
              selected={false}
              onClick={() => {
                if (gameState === 'player_turn') {
                  handleMove(move);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;

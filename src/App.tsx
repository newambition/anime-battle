import HealthBar from './components/HealthBar.tsx';
import BattleLog from './components/BattleLog.tsx';
import CharacterSprite from './components/CharacterSprite.tsx';
import CharacterSelect from './components/CharacterSelect.tsx';
import useBattleStore from './store/battleStore.ts';
import HomeButton from './components/HomeButton.tsx';
import MoveButton from './components/MoveButton.tsx';
import Footer from './components/footer.tsx';
import type { Move } from './data/battleData.ts';
import backgroundMusic from './assets/my-8-bit-hero-301280.mp3';

function App() {
  const { gameState, player, opponent, battleLog, handleMove, restart } =
    useBattleStore();

  if (gameState === 'selecting') {
    return <CharacterSelect />;
  }

  const getMoveButtonColor = (move: Move) => {
    if (gameState !== 'player_turn') {
      return 'bg-gray-500';
    }
    // A move is an effect move if it has an `effect` or `effects` property.
    if (move.effect || (move.effects && move.effects.length > 0)) {
      return 'bg-blue-400'; // Color for effect moves
    }
    return 'bg-yellow-400'; // Color for damage moves
  };

  return (
    <div className="flex flex-col p-5 text-black">
      <div onClick={restart}>
        <HomeButton />
      </div>

      {/* Opponent Section */}
      {opponent && (
        <div className="mt-auto flex items-center justify-between">
          <HealthBar
            name={opponent.name}
            currentHp={opponent.hp}
            maxHp={opponent.maxHp}
            stats={`${opponent.hp}/${opponent.maxHp}`}
            isPlayer={false}
          />
          <CharacterSprite character={opponent} isPlayer={false} />
        </div>
      )}

      {/*VS Card*/}
      <div className="mx-auto mt-4 w-fit transform animate-pulse rounded-2xl bg-yellow-400 px-2 py-2 text-center text-black shadow-lg duration-1000 ease-in-out">
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
            stats={`${player.hp}/${player.maxHp}`}
            isPlayer={true}
          />
        </div>
      )}

      <audio src={backgroundMusic} autoPlay loop />

      {/* Battle Log */}
      <div className="mb-2 rounded-2xl bg-white/60 p-4 text-black shadow-lg">
        <BattleLog messages={battleLog} />
      </div>

      {/* Move Buttons */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {gameState === 'game_over' ? (
          <button
            onClick={restart}
            className="col-span-2 rounded-2xl bg-blue-400 px-4 py-2 font-bold text-white shadow-lg"
          >
            Restart
          </button>
        ) : (
          player?.moves.map((move) => (
            <MoveButton
              key={move.id}
              name={move.name}
              icon={move.emoji || ''}
              color={getMoveButtonColor(move)}
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

      <Footer />
    </div>
  );
}

export default App;

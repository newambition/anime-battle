import HealthBar from './components/HealthBar.tsx';
import BattleLog from './components/BattleLog.tsx';
import CharacterSprite from './components/CharacterSprite.tsx';
import CharacterSelect from './components/CharacterSelect.tsx';
import { RotateCcw } from 'lucide-react';
import Footer from './components/footer.tsx';
import useBattleStore from './store/battleStore.ts';

function App() {
  const {
    gameState,
    player,
    opponent,
    battleLog,
    handleMove,
    restart,
  } = useBattleStore();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="bg-ab-bg flex max-h-dvh items-center justify-center px-2 py-1">
        <div className="battle-container relative flex flex-col gap-4 rounded-xl p-2">
          {gameState !== 'selecting' && (
            <button
              onClick={restart}
              className="border-ab-border hover:bg-ab-highlight-44 absolute top-2 left-2 rounded-lg border-2 p-2 text-xl"
            >
              <RotateCcw
                className="hover:text-ab-highlight-44 h-4 w-4"
                strokeWidth={2}
              />
            </button>
          )}
          {gameState === 'selecting' ? (
            <CharacterSelect />
          ) : (
            <div className="flex w-full flex-1 flex-col justify-between p-4 pt-16">
              {opponent && (
                <div className="flex w-full items-center justify-between gap-2 pt-8">
                  <div className="order-2 flex-shrink-0">
                    <CharacterSprite character={opponent} isPlayer={false} />
                  </div>
                  <div className="order-1 flex-1">
                    <HealthBar
                      name={opponent.name}
                      currentHp={opponent.hp}
                      maxHp={opponent.maxHp}
                      variant="bl"
                    />
                  </div>
                </div>
              )}
              {player && (
                <div className="flex w-full items-center justify-between gap-2 pb-2">
                  <div className="order-1 flex-shrink-0">
                    <CharacterSprite character={player} isPlayer={true} />
                  </div>
                  <div className="order-2 flex-1">
                    <HealthBar
                      name={player.name}
                      currentHp={player.hp}
                      maxHp={player.maxHp}
                      variant="br"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex w-full flex-col gap-6 rounded-lg p-2">
            <div className="w-full">
              {gameState !== 'selecting' && battleLog.length > 0 && (
                <BattleLog messages={battleLog} />
              )}
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {gameState === 'game_over' ? (
                <button
                  onClick={restart}
                  className="move-button col-span-2 text-xl"
                >
                  Restart
                </button>
              ) : gameState === 'selecting' || !player ? (
                <div className="text-md col-span-2 text-center opacity-70"></div>
              ) : (
                player.moves.map((move) => (
                  <button
                    key={move.id}
                    className="move-button text-sm"
                    onClick={() => handleMove(move)}
                    disabled={gameState !== 'player_turn'}
                  >
                    {move.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
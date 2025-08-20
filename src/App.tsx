import { useState, useEffect } from 'react';
import { CHARACTERS, type Character, type Move } from './data/battleData.ts';
import HealthBar from './components/HealthBar.tsx';
import BattleLog from './components/BattleLog.tsx';
import CharacterSprite from './components/CharacterSprite.tsx';
import CharacterSelect from './components/CharacterSelect.tsx';
import { RotateCcw } from 'lucide-react';
import { initializeBattleState, takeTurn } from './engine/engine.ts';
import { type BattleState, type BattleEvent } from './engine/battleTypes.ts';

function processEvents(
  events: BattleEvent[],
  state: BattleState,
  move?: Move
): string[] {
  const messages: string[] = [];
  for (const event of events) {
    switch (event.type) {
      case 'turn_start':
        if (move) {
          messages.push(
            `${event.side === 'player' ? state.player.name : state.opponent.name} used ${move.name}!`
          );
        }
        break;
      case 'damage':
        let msg = `It did ${event.amount} damage!`;
        if (event.totalHits && event.totalHits > 1) {
          msg = `Hit ${event.hitIndex}/${event.totalHits}: ${event.amount} damage!`;
        }
        messages.push(msg);
        break;
      case 'miss':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name}'s attack missed!`
        );
        break;
      case 'hp_cost_paid':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name} paid ${event.amount} HP to use the move.`
        );
        break;
      case 'recoil':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name} took ${event.amount} recoil damage.`
        );
        break;
      case 'stat_change':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name}'s ${event.stat} ${event.change > 0 ? 'rose' : 'fell'}!`
        );
        break;
      case 'charge_started':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name} is charging up!`
        );
        break;
      case 'charge_released':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name} unleashed its charged power!`
        );
        break;
      case 'faint':
        messages.push(
          `${event.side === 'player' ? state.player.name : state.opponent.name} fainted!`
        );
        if (event.side === 'opponent') {
          messages.push('You win!');
        } else {
          messages.push('You lose!');
        }
        break;
    }
  }
  return messages;
}

function App() {
  const [player, setPlayer] = useState<(Character & { maxHp: number }) | null>(
    null
  );
  const [opponent, setOpponent] = useState<
    (Character & { maxHp: number }) | null
  >(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [gameState, setGameState] = useState('selecting'); // selecting, player_turn, opponent_turn, animating, game_over
  const [battleState, setBattleState] = useState<BattleState | null>(null);

  const [playerChoiceId, setPlayerChoiceId] = useState<string>('p001');
  const [opponentChoiceId, setOpponentChoiceId] = useState<string>('e001');

  const startBattle = () => {
    const chosenPlayer = CHARACTERS[playerChoiceId];
    const chosenOpponent = CHARACTERS[opponentChoiceId];
    const initialState = initializeBattleState(chosenPlayer, chosenOpponent);
    setBattleState(initialState);
    setPlayer(initialState.player);
    setOpponent(initialState.opponent);
    setBattleLog(['The battle begins!']);
    setGameState('player_turn');
  };

  const handleMove = (move: Move) => {
    if (gameState !== 'player_turn' || !player || !opponent || !battleState)
      return;

    setGameState('animating');

    const { state: newState, events } = takeTurn(
      battleState,
      'player',
      move.id
    );
    const newLogMessages = processEvents(events, newState, move);

    setBattleState(newState);
    setPlayer(newState.player);
    setOpponent(newState.opponent);
    setBattleLog(newLogMessages);

    if (newState.opponent.hp > 0) {
      setTimeout(() => setGameState('opponent_turn'), 2000);
    }
  };

  useEffect(() => {
    if (gameState === 'opponent_turn' && battleState) {
      setTimeout(() => {
        const move =
          battleState.opponent.moves[
            Math.floor(Math.random() * battleState.opponent.moves.length)
          ];

        const { state: newState, events } = takeTurn(
          battleState,
          'opponent',
          move.id
        );

        const newLogMessages = processEvents(events, newState, move);

        setBattleState(newState);
        setPlayer(newState.player);
        setOpponent(newState.opponent);
        setBattleLog((prev) => [...prev, ...newLogMessages]);

        if (newState.player.hp > 0) {
          setTimeout(() => setGameState('player_turn'), 2000);
        }
      }, 1000);
    }
  }, [gameState]);

  const handleRestart = () => {
    setPlayer(null);
    setOpponent(null);
    setBattleLog([]);
    setPlayerChoiceId('p001');
    setOpponentChoiceId('e001');
    setGameState('selecting');
    setBattleState(null);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-200 px-2 py-1">
      <div className="battle-container relative flex flex-col gap-4 rounded-xl p-2">
        {gameState !== 'selecting' && (
          <button
            onClick={handleRestart}
            className="absolute top-2 left-2 rounded-lg border-2 border-gray-600 p-2 text-xl"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
        {gameState === 'selecting' ? (
          <CharacterSelect
            characters={CHARACTERS}
            playerChoiceId={playerChoiceId}
            opponentChoiceId={opponentChoiceId}
            onChangePlayer={setPlayerChoiceId}
            onChangeOpponent={setOpponentChoiceId}
            onStartBattle={startBattle}
          />
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

        <div className="flex w-full flex-col gap-2 rounded-lg p-2">
          <div className="w-full">
            <BattleLog messages={battleLog} />
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            {gameState === 'game_over' ? (
              <button
                onClick={handleRestart}
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
  );
}

export default App;

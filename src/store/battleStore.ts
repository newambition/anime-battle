import { create } from 'zustand';
import type {
  BattleState,
  BattleCharacter,
  BattleEvent,
} from '../engine/battleTypes';
import { CHARACTERS, type Move } from '../data/battleData';
import { initializeBattleState, takeTurn } from '../engine/engine';

type GameStatus =
  | 'selecting'
  | 'player_turn'
  | 'opponent_turn'
  | 'animating'
  | 'game_over';

interface BattleStoreState {
  gameState: GameStatus;
  battleState: BattleState | null;
  battleLog: string[];
  playerChoiceId: string;
  opponentChoiceId: string;
  player: (BattleCharacter & { maxHp: number }) | null;
  opponent: (BattleCharacter & { maxHp: number }) | null;
}

interface BattleStoreActions {
  setPlayerChoice: (id: string) => void;
  setOpponentChoice: (id: string) => void;
  startBattle: () => void;
  handleMove: (move: Move) => void;
  restart: () => void;
}

// Helper function moved from App.tsx
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

const useBattleStore = create<BattleStoreState & BattleStoreActions>(
  (set, get) => ({
    // Initial State
    gameState: 'selecting',
    battleState: null,
    battleLog: [],
    playerChoiceId: 'p001',
    opponentChoiceId: 'e001',
    player: null,
    opponent: null,

    // Actions
    setPlayerChoice: (id) => set({ playerChoiceId: id }),

    setOpponentChoice: (id) => set({ opponentChoiceId: id }),

    startBattle: () => {
      const { playerChoiceId, opponentChoiceId } = get();
      const chosenPlayer = CHARACTERS[playerChoiceId];
      const chosenOpponent = CHARACTERS[opponentChoiceId];
      const initialState = initializeBattleState(chosenPlayer, chosenOpponent);
      set({
        battleState: initialState,
        player: initialState.player,
        opponent: initialState.opponent,
        battleLog: ['The battle begins!'],
        gameState: 'player_turn',
      });
    },

    handleMove: (move) => {
      const { battleState, opponent } = get();
      if (get().gameState !== 'player_turn' || !battleState || !opponent)
        return;

      set({ gameState: 'animating' });

      // Player's turn
      const { state: playerTurnState, events: playerEvents } = takeTurn(
        battleState,
        'player',
        move.id
      );
      const playerLogMessages = processEvents(
        playerEvents,
        playerTurnState,
        move
      );

      set({
        battleState: playerTurnState,
        player: playerTurnState.player,
        opponent: playerTurnState.opponent,
        battleLog: playerLogMessages,
      });

      if (playerTurnState.opponent.hp <= 0) {
        set({ gameState: 'game_over' });
        return;
      }

      // Opponent's turn
      setTimeout(() => {
        const { battleState: currentBattleState } = get();
        if (!currentBattleState) return;

        const opponentMove =
          currentBattleState.opponent.moves[
            Math.floor(Math.random() * currentBattleState.opponent.moves.length)
          ];

        const { state: opponentTurnState, events: opponentEvents } = takeTurn(
          currentBattleState,
          'opponent',
          opponentMove.id
        );

        const opponentLogMessages = processEvents(
          opponentEvents,
          opponentTurnState,
          opponentMove
        );

        set((state) => ({
          battleState: opponentTurnState,
          player: opponentTurnState.player,
          opponent: opponentTurnState.opponent,
          battleLog: [...state.battleLog, ...opponentLogMessages],
        }));

        if (opponentTurnState.player.hp <= 0 || opponentTurnState.opponent.hp <= 0) {
          set({ gameState: 'game_over' });
          return;
        }

        set({ gameState: 'player_turn' });
      }, 4000);
    },

    restart: () => {
      set({
        gameState: 'selecting',
        battleState: null,
        battleLog: [],
        playerChoiceId: 'p001',
        opponentChoiceId: 'e001',
        player: null,
        opponent: null,
      });
    },
  })
);

export default useBattleStore;

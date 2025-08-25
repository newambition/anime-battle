import { create } from 'zustand';
import type {
  BattleState,
  BattleCharacter,
  BattleEvent,
} from '../engine/battleTypes';
import { CHARACTERS, type Move } from '../data/battleData';
import { initializeBattleState, takeTurn } from '../engine/engine';

type GameStatus =
  | 'splash'
  | 'selecting'
  | 'player_turn'
  | 'opponent_turn'
  | 'animating'
  | 'game_over';

export type AnimationType = 'shake' | 'glow' | null;

interface BattleStoreState {
  gameState: GameStatus;
  battleState: BattleState | null;
  battleLog: string[];
  playerChoiceId: string;
  opponentChoiceId: string;
  player: (BattleCharacter & { maxHp: number }) | null;
  opponent: (BattleCharacter & { maxHp: number }) | null;
  playerAnimation: AnimationType;
  opponentAnimation: AnimationType;
  playerHealthFlash: boolean;
  opponentHealthFlash: boolean;
}

interface BattleStoreActions {
  setPlayerChoice: (id: string) => void;
  setOpponentChoice: (id: string) => void;
  startBattle: () => void;
  handleMove: (move: Move) => void;
  restart: () => void;
  completeSplash: () => void;
}

// Helper function to process battle log messages
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
            `${move.emoji || '💥'} ${event.side === 'player' ? state.player.name : state.opponent.name} used ${move.name}!`
          );
        }
        break;
      case 'damage': {
        let msg = `💥 It did ${event.amount} damage!`;
        if (event.totalHits && event.totalHits > 1) {
          msg = `💥 Hit ${event.hitIndex}/${event.totalHits}: ${event.amount} damage!`;
        }
        messages.push(msg);
        break;
      }
      case 'miss':
        messages.push(
          `💨 ${event.side === 'player' ? state.player.name : state.opponent.name}'s attack missed!`
        );
        break;
      case 'hp_cost_paid':
        messages.push(
          `💔 ${event.side === 'player' ? state.player.name : state.opponent.name} paid ${event.amount} HP to use the move.`
        );
        break;
      case 'recoil':
        messages.push(
          `💥 ${event.side === 'player' ? state.player.name : state.opponent.name} took ${event.amount} recoil damage.`
        );
        break;
      case 'stat_change':
        messages.push(
          `${event.change > 0 ? '📈' : '📉'} ${event.side === 'player' ? state.player.name : state.opponent.name}'s ${event.stat} ${event.change > 0 ? 'rose' : 'fell'}!`
        );
        break;
      case 'heal':
        messages.push(
          `💔 ${event.side === 'player' ? state.player.name : state.opponent.name} healed for ${event.amount} HP!`
        );
        break;
      case 'charge_started':
        messages.push(
          `🔋  ${event.side === 'player' ? state.player.name : state.opponent.name} is charging up!`
        );
        break;
      case 'charge_released':
        messages.push(
          `⚡️ ${event.side === 'player' ? state.player.name : state.opponent.name} unleashed its charged power!`
        );
        break;
      case 'faint':
        messages.push(
          `😵 ${event.side === 'player' ? state.player.name : state.opponent.name} fainted!`
        );
        if (event.side === 'opponent') {
          messages.push('🎉 You win!');
        } else {
          messages.push(' 😢 You lose!');
        }
        break;
    }
  }
  return messages;
}

const useBattleStore = create<BattleStoreState & BattleStoreActions>(
  (set, get) => ({
    // Initial State
    gameState: 'splash',
    battleState: null,
    battleLog: [],
    playerChoiceId: '',
    opponentChoiceId: '',
    player: null,
    opponent: null,
    playerAnimation: null,
    opponentAnimation: null,
    playerHealthFlash: false,
    opponentHealthFlash: false,

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
        battleLog: [
          '⚔️ The battle begins! ⚔️',
          '🔵 Blue buttons: Effects moves such as Increase defense, Increase attack, etc. Theese are tactical moves that can be used to your advantage.',
          '🟡 Yellow buttons: Are the ones that deal damage to the opponent.',
        ],
        gameState: 'player_turn',
      });
    },

    handleMove: (move) => {
      const { battleState } = get();
      if (get().gameState !== 'player_turn' || !battleState) return;

      // --- Player's Turn ---
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

      let playerAnimationUpdate: AnimationType = null;
      let opponentAnimationUpdate: AnimationType = null;
      let playerHealthFlashUpdate = false;
      let opponentHealthFlashUpdate = false;

      playerEvents.forEach((event) => {
        if (event.type === 'damage') {
          opponentAnimationUpdate = 'shake';
          opponentHealthFlashUpdate = true;
          navigator.vibrate(200);
        }
        if (event.type === 'recoil') {
          playerAnimationUpdate = 'shake';
          playerHealthFlashUpdate = true;
          navigator.vibrate(200);
        }
        if (event.type === 'charge_started') {
          playerAnimationUpdate = 'glow';
        }
        if (event.type === 'heal') {
          playerAnimationUpdate = 'glow';
        }
      });

      set((state) => ({
        gameState: 'animating',
        battleState: playerTurnState,
        player: playerTurnState.player,
        opponent: playerTurnState.opponent,
        battleLog: [...state.battleLog, ...playerLogMessages],
        playerAnimation: playerAnimationUpdate,
        opponentAnimation: opponentAnimationUpdate,
        playerHealthFlash: playerHealthFlashUpdate,
        opponentHealthFlash: opponentHealthFlashUpdate,
      }));

      if (playerTurnState.opponent.hp <= 0) {
        set({ gameState: 'game_over' });
        return;
      }

      // --- Opponent's Turn ---
      setTimeout(() => {
        const { battleState: currentBattleState } = get();
        if (!currentBattleState) return;

        // Reset player's one-off animations
        set({
          playerAnimation: null,
          opponentAnimation: null,
          playerHealthFlash: false,
          opponentHealthFlash: false,
        });

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

        let playerAnimationUpdate_opp: AnimationType = null;
        let opponentAnimationUpdate_opp: AnimationType = null;
        let playerHealthFlashUpdate_opp = false;
        let opponentHealthFlashUpdate_opp = false;

        opponentEvents.forEach((event) => {
          if (event.type === 'damage') {
            playerAnimationUpdate_opp = 'shake';
            playerHealthFlashUpdate_opp = true;
            navigator.vibrate(200);
          }
          if (event.type === 'recoil') {
            opponentAnimationUpdate_opp = 'shake';
            opponentHealthFlashUpdate_opp = true;
            navigator.vibrate(200);
          }
          if (event.type === 'charge_started') {
            opponentAnimationUpdate_opp = 'glow';
          }
          if (event.type === 'heal') {
            opponentAnimationUpdate_opp = 'glow';
          }
        });

        set((state) => ({
          battleState: opponentTurnState,
          player: opponentTurnState.player,
          opponent: opponentTurnState.opponent,
          battleLog: [...state.battleLog, ...opponentLogMessages],
          playerAnimation: playerAnimationUpdate_opp,
          opponentAnimation: opponentAnimationUpdate_opp,
          playerHealthFlash: playerHealthFlashUpdate_opp,
          opponentHealthFlash: opponentHealthFlashUpdate_opp,
        }));

        if (
          opponentTurnState.player.hp <= 0 ||
          opponentTurnState.opponent.hp <= 0
        ) {
          set({ gameState: 'game_over' });
          return;
        }

        setTimeout(() => {
          set({
            playerAnimation: null,
            opponentAnimation: null,
            playerHealthFlash: false,
            opponentHealthFlash: false,
            gameState: 'player_turn',
          });
        }, 2000);
      }, 3500);
    },

    restart: () => {
      set({
        gameState: 'selecting',
        battleState: null,
        battleLog: [],
        playerChoiceId: '',
        opponentChoiceId: '',
        player: null,
        opponent: null,
        playerAnimation: null,
        opponentAnimation: null,
        playerHealthFlash: false,
        opponentHealthFlash: false,
      });
    },

    completeSplash: () => {
      set({ gameState: 'selecting' });
    },
  })
);

export default useBattleStore;

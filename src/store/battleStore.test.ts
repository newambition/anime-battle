import { describe, it, expect, beforeEach, vi } from 'vitest';
import useBattleStore from './battleStore';
import { CHARACTERS } from '../data/battleData';

describe('battleStore - Core Actions', () => {
  beforeEach(() => {
    const initialState = useBattleStore.getState();
    useBattleStore.setState({ ...initialState, gameState: 'selecting', battleState: null, battleLog: [], player: null, opponent: null });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should initialize a battle with startBattle', () => {
    useBattleStore.getState().setPlayerChoice('p001');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    const state = useBattleStore.getState();
    expect(state.gameState).toBe('player_turn');
    expect(state.battleState).not.toBeNull();
    expect(state.player?.id).toBe('p001');
    expect(state.opponent?.id).toBe('e001');
  });

  it('should reset the state with restart', () => {
    useBattleStore.getState().setPlayerChoice('p001');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    useBattleStore.getState().restart();
    const state = useBattleStore.getState();
    expect(state.gameState).toBe('selecting');
    expect(state.battleState).toBeNull();
  });

  it('should process a full player and opponent turn with handleMove', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    useBattleStore.getState().setPlayerChoice('p001');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    const initialPlayerHp = useBattleStore.getState().player?.hp;
    const initialOpponentHp = useBattleStore.getState().opponent?.hp;
    const playerMove = useBattleStore.getState().player?.moves[0]!;
    useBattleStore.getState().handleMove(playerMove);
    await vi.runAllTimersAsync();
    const finalState = useBattleStore.getState();
    expect(finalState.opponent?.hp).toBeLessThan(initialOpponentHp!);
    expect(finalState.player?.hp).toBeLessThan(initialPlayerHp!);
    expect(finalState.gameState).toBe('player_turn');
    vi.spyOn(Math, 'random').mockRestore();
  });
});

describe('battleStore - Specific Move Mechanics', () => {
  beforeEach(() => {
    const initialState = useBattleStore.getState();
    useBattleStore.setState({ ...initialState, gameState: 'selecting', battleState: null, battleLog: [], player: null, opponent: null });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should handle multi-hit moves correctly', async () => {
    useBattleStore.getState().setPlayerChoice('p009');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    const multiHitMove = useBattleStore.getState().player?.moves.find(m => m.id === 'm033')!;
    useBattleStore.getState().handleMove(multiHitMove);
    await vi.runAllTimersAsync();
    const finalLog = useBattleStore.getState().battleLog;
    const hitMessages = finalLog.filter(msg => msg.includes('Hit 1/2') || msg.includes('Hit 2/2'));
    expect(hitMessages.length).toBe(2);
  });

  it('should handle charge moves correctly', async () => {

    vi.spyOn(Math, 'random').mockReturnValue(0);
    useBattleStore.getState().setPlayerChoice('p004');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    const chargeMove = useBattleStore.getState().player?.moves.find(m => m.id === 'm016')!;
    const initialOpponentHp = useBattleStore.getState().opponent?.hp;
    useBattleStore.getState().handleMove(chargeMove);
    expect(useBattleStore.getState().battleState?.playerCharge).not.toBeNull();
    await vi.runAllTimersAsync();
    const anyMove = useBattleStore.getState().player?.moves[0]!;
    useBattleStore.getState().handleMove(anyMove);
    expect(useBattleStore.getState().battleState?.playerCharge).toBeNull();
    expect(useBattleStore.getState().opponent?.hp).toBeLessThan(initialOpponentHp!);
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('should apply recoil damage for moves with power', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // Ensure the move hits
    useBattleStore.getState().setPlayerChoice('p001');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    const initialPlayerHp = useBattleStore.getState().player?.hp!;
    const recoilMove = useBattleStore.getState().player?.moves.find(m => m.id === 'm003')!;
    useBattleStore.getState().handleMove(recoilMove);
    expect(useBattleStore.getState().player?.hp).toBe(initialPlayerHp - 20);
    vi.spyOn(Math, 'random').mockRestore();
  });

  it('should end the game when a character faints', async () => {
    useBattleStore.getState().setPlayerChoice('p001');
    useBattleStore.getState().setOpponentChoice('e001');
    useBattleStore.getState().startBattle();
    useBattleStore.setState(state => ({
      ...state,
      battleState: {
        ...state.battleState!,
        opponent: { ...state.battleState!.opponent, hp: 10 },
      }
    }));
    const playerMove = useBattleStore.getState().player?.moves[0]!;
    useBattleStore.getState().handleMove(playerMove);
    await vi.runAllTimersAsync();
    const finalState = useBattleStore.getState();
    expect(finalState.opponent?.hp).toBe(0);
    expect(finalState.gameState).toBe('game_over');
  });
});
import type { Move } from '../data/battleData';
import type {
  ActorSide,
  BattleEvent,
  BattleState,
  ChargeState,
} from './battleTypes';

/** Returns the charge state for a side. */
export function getCharge(
  state: BattleState,
  side: ActorSide
): ChargeState | null {
  return side === 'player' ? state.playerCharge : state.opponentCharge;
}

/** Sets the charge state for a side, returning a new BattleState. */
export function setCharge(
  state: BattleState,
  side: ActorSide,
  charge: ChargeState | null
): BattleState {
  return side === 'player'
    ? { ...state, playerCharge: charge }
    : { ...state, opponentCharge: charge };
}

/** Start charging if the move requires it and none is pending. */
export function maybeStartCharge(
  state: BattleState,
  side: ActorSide,
  move: Move
): { state: BattleState; started: boolean; events: BattleEvent[] } {
  const events: BattleEvent[] = [];
  const current = getCharge(state, side);
  const turns = move.chargeTurns ?? 0;
  if (turns > 0 && !current) {
    const next: ChargeState = { moveId: move.id, turnsLeft: turns };
    const newState = setCharge(state, side, next);
    events.push({ type: 'charge_started', side, moveId: move.id, turns });
    return { state: newState, started: true, events };
  }
  return { state, started: false, events };
}

/** Decrement one turn from an existing charge for the side, if any. */
export function tickCharge(
  state: BattleState,
  side: ActorSide
): { state: BattleState; ready: boolean } {
  const current = getCharge(state, side);
  if (!current) return { state, ready: false };
  const remaining = Math.max(0, current.turnsLeft - 1);
  const updated: ChargeState = { ...current, turnsLeft: remaining };
  const newState = setCharge(state, side, updated);
  return { state: newState, ready: remaining === 0 };
}

/**
 * If a charged move has completed (turnsLeft === 0), release it by clearing the
 * charge slot and returning the associated Move via the provided resolver.
 */
export function maybeReleaseCharge(
  state: BattleState,
  side: ActorSide,
  resolveMoveById: (moveId: string) => Move | undefined
): { state: BattleState; move: Move | null; events: BattleEvent[] } {
  const current = getCharge(state, side);
  if (!current || current.turnsLeft > 0) {
    return { state, move: null, events: [] };
  }
  const move = resolveMoveById(current.moveId);
  const cleared = setCharge(state, side, null);
  const events: BattleEvent[] = move
    ? [{ type: 'charge_released', side, moveId: move.id }]
    : [];
  return { state: cleared, move: move ?? null, events };
}

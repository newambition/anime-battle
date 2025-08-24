import { describe, it, expect } from 'vitest';
import { CHARACTERS } from '../data/battleData';
import { createBattleCharacter, initializeBattleState } from './engine';
import {
  maybeStartCharge,
  tickCharge,
  maybeReleaseCharge,
  getCharge,
} from './charge';

const player = createBattleCharacter(CHARACTERS.p004); // Goku
const opponent = createBattleCharacter(CHARACTERS.e001); // Naruto
const initialState = initializeBattleState(player, opponent);
const chargeMove = player.moves.find((m) => m.chargeTurns && m.chargeTurns > 0);

describe('charge', () => {
  it('should start a charge', () => {
    if (!chargeMove) throw new Error('Charge move not found for Goku');
    const { state, started } = maybeStartCharge(initialState, 'player', chargeMove);
    expect(started).toBe(true);
    const chargeState = getCharge(state, 'player');
    expect(chargeState).not.toBeNull();
    expect(chargeState?.moveId).toBe(chargeMove.id);
    expect(chargeState?.turnsLeft).toBe(1);
  });

  it('should tick a charge', () => {
    if (!chargeMove) throw new Error('Charge move not found for Goku');
    const { state: startedState } = maybeStartCharge(initialState, 'player', chargeMove);
    const { state: tickedState, ready } = tickCharge(startedState, 'player');
    expect(ready).toBe(true);
    const chargeState = getCharge(tickedState, 'player');
    expect(chargeState?.turnsLeft).toBe(0);
  });

  it('should release a charge', () => {
    if (!chargeMove) throw new Error('Charge move not found for Goku');
    const { state: startedState } = maybeStartCharge(initialState, 'player', chargeMove);
    const { state: tickedState } = tickCharge(startedState, 'player');
    const { state: releasedState, move } = maybeReleaseCharge(tickedState, 'player', (id) => 
      player.moves.find((m) => m.id === id)
    );
    expect(move).not.toBeNull();
    expect(move?.id).toBe(chargeMove.id);
    const chargeState = getCharge(releasedState, 'player');
    expect(chargeState).toBeNull();
  });
});

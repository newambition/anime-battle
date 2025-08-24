import { describe, it, expect, vi } from 'vitest';
import { CHARACTERS } from '../data/battleData';
import { createBattleCharacter } from './engine';
import {
  normalizeMoveEffects,
  applyStatChanges,
  applyEnemyDebuffs,
  applyStatuses,
} from './effects';

const mockPlayer = createBattleCharacter(CHARACTERS.p001); // Kanao
const mockOpponent = createBattleCharacter(CHARACTERS.e001); // Naruto

describe('effects', () => {
  describe('normalizeMoveEffects', () => {
    it('should handle legacy single effect', () => {
      const move = { id: 'm1', name: 'Test', power: 0, accuracy: 1, effect: 'attack_up', value: 1 };
      const effects = normalizeMoveEffects(move);
      expect(effects).toHaveLength(1);
      expect(effects[0].type).toBe('attack_up');
    });

    it('should handle new effects array', () => {
      const move = {
        id: 'm1',
        name: 'Test',
        power: 0,
        accuracy: 1,
        effects: [{ type: 'attack_up', value: 1 }, { type: 'defense_up', value: 1 }],
      };
      const effects = normalizeMoveEffects(move);
      expect(effects).toHaveLength(2);
      expect(effects[0].type).toBe('attack_up');
      expect(effects[1].type).toBe('defense_up');
    });
  });

  describe('applyStatChanges', () => {
    it('should apply a defense_up effect', () => {
      const move = { id: 'm1', name: 'Guard Up', power: 0, accuracy: 1, effect: 'defense_up', value: 1 };
      const { actor } = applyStatChanges(mockPlayer, move, 'player');
      expect(actor.stages.defense).toBe(1);
    });
  });

  describe('applyEnemyDebuffs', () => {
    it('should apply an enemy_defense_down effect', () => {
      const move = { id: 'm1', name: 'Weaken', power: 0, accuracy: 1, effect: 'enemy_defense_down', value: 1 };
      const { target } = applyEnemyDebuffs(mockOpponent, move, 'opponent');
      expect(target.stages.defense).toBe(-1);
    });
  });

  describe('applyStatuses', () => {
    it('should apply paralyze on successful roll', () => {
      const move = { id: 'm1', name: 'Thunder Wave', power: 0, accuracy: 1, effect: 'paralyze', chance: 0.5 };
      const rng = vi.fn(() => 0.4); // Lower than chance
      const { target } = applyStatuses(mockPlayer, mockOpponent, move, 'player', 'opponent', true, rng);
      expect(target.status.paralyze).toBe(true);
    });

    it('should not apply paralyze on failed roll', () => {
      const move = { id: 'm1', name: 'Thunder Wave', power: 0, accuracy: 1, effect: 'paralyze', chance: 0.5 };
      const rng = vi.fn(() => 0.6); // Higher than chance
      const { target } = applyStatuses(mockPlayer, mockOpponent, move, 'player', 'opponent', true, rng);
      expect(target.status.paralyze).toBeUndefined();
    });
  });
});

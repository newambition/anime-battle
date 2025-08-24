import { describe, it, expect, vi } from 'vitest';
import {
  getStageMultiplier,
  computeDamage,
  rollHit,
  rollCrit,
  applyHpCost,
  applyRecoil,
} from './battleMath';

describe('battleMath', () => {
  describe('getStageMultiplier', () => {
    it('should return 1 for stage 0', () => {
      expect(getStageMultiplier(0)).toBe(1);
    });

    it('should return correct multiplier for positive stages', () => {
      expect(getStageMultiplier(1)).toBe(1.5);
      expect(getStageMultiplier(2)).toBe(2);
    });

    it('should return correct multiplier for negative stages', () => {
      expect(getStageMultiplier(-1)).toBeCloseTo(1 / 1.5);
      expect(getStageMultiplier(-2)).toBeCloseTo(1 / 2);
    });
  });

  describe('computeDamage', () => {
    it('should calculate baseline damage', () => {
      const damage = computeDamage(100, 0, 100, 0, 50, false);
      expect(damage).toBeGreaterThan(0);
    });

    it('should increase damage with positive attack stages', () => {
      const baseline = computeDamage(100, 0, 100, 0, 50, false);
      const boosted = computeDamage(100, 1, 100, 0, 50, false);
      expect(boosted).toBeGreaterThan(baseline);
    });

    it('should decrease damage with negative attack stages', () => {
      const baseline = computeDamage(100, 0, 100, 0, 50, false);
      const reduced = computeDamage(100, -1, 100, 0, 50, false);
      expect(reduced).toBeLessThan(baseline);
    });

    it('should apply critical hit multiplier', () => {
      const baseline = computeDamage(100, 0, 100, 0, 50, false);
      const crit = computeDamage(100, 0, 100, 0, 50, true);
      expect(crit).toBeGreaterThan(baseline);
    });

    it('should ignore defense with defenseIgnorePct', () => {
      const baseline = computeDamage(100, 0, 100, 0, 50, false);
      const ignored = computeDamage(100, 0, 100, 0, 50, false, 0.5);
      expect(ignored).toBeGreaterThan(baseline);
    });
  });

  describe('rollHit and rollCrit', () => {
    it('rollHit should return true when rng is low', () => {
      const rng = vi.fn(() => 0.1);
      expect(rollHit(0.9, rng)).toBe(true);
    });

    it('rollHit should return false when rng is high', () => {
      const rng = vi.fn(() => 0.95);
      expect(rollHit(0.9, rng)).toBe(false);
    });

    it('rollCrit should return true for high crit move when rng is low', () => {
      const rng = vi.fn(() => 0.1);
      expect(rollCrit(true, rng)).toBe(true);
    });

    it('rollCrit should return false for high crit move when rng is high', () => {
      const rng = vi.fn(() => 0.2);
      expect(rollCrit(true, rng)).toBe(false);
    });
  });

  describe('applyHpCost and applyRecoil', () => {
    it('applyHpCost should deduct HP', () => {
      const { hp } = applyHpCost(100, 20);
      expect(hp).toBe(80);
    });

    it('applyHpCost should set fainted flag', () => {
      const { hp, fainted } = applyHpCost(20, 20);
      expect(hp).toBe(0);
      expect(fainted).toBe(true);
    });

    it('applyRecoil should deduct HP', () => {
      const { hp } = applyRecoil(100, 30);
      expect(hp).toBe(70);
    });

    it('applyRecoil should set fainted flag', () => {
      const { hp, fainted } = applyRecoil(30, 30);
      expect(hp).toBe(0);
      expect(fainted).toBe(true);
    });
  });
});

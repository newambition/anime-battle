// Stage math helpers and constants (no runtime integration yet)

export const MIN_STAGE = -6;
export const MAX_STAGE = 6;

export const MIN_STAT_MULTIPLIER = 0.1;
export const MAX_STAT_MULTIPLIER = 1.25;

export const MIN_ACCURACY = 0.1;
export const MAX_ACCURACY = 1.0;

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function clampStage(stage: number): number {
  return clamp(stage, MIN_STAGE, MAX_STAGE);
}

// For stages s >= 0: 1 + 0.5 * s
// For stages s < 0: 1 / (1 + 0.5 * |s|)
export function getStageMultiplier(stage: number): number {
  const s = clampStage(stage);
  const multiplier = s >= 0 ? 1 + 0.5 * s : 1 / (1 + 0.5 * Math.abs(s));
  return clamp(multiplier, MIN_STAT_MULTIPLIER, MAX_STAT_MULTIPLIER);
}

export function applyAccuracyStages(
  baseAccuracy: number,
  accuracyStage: number
): number {
  const multiplier = getStageMultiplier(accuracyStage);
  const adjusted = baseAccuracy * multiplier;
  return clamp(adjusted, MIN_ACCURACY, MAX_ACCURACY);
}

// Probabilities and crit multiplier
export const BASE_CRIT_CHANCE = 0.05; // 10%
export const HIGH_CRIT_CHANCE = 0.15; // 30%
export const CRIT_MULTIPLIER = 1.15;

export function rollHit(
  adjustedAccuracy: number,
  rng: () => number = Math.random
): boolean {
  return rng() < clamp(adjustedAccuracy, MIN_ACCURACY, MAX_ACCURACY);
}

export function rollCrit(
  isHighCrit: boolean,
  rng: () => number = Math.random
): boolean {
  const chance = isHighCrit ? HIGH_CRIT_CHANCE : BASE_CRIT_CHANCE;
  return rng() < chance;
}

export function computeEffectiveDefense(
  baseDefense: number,
  defenseStage: number,
  defenseIgnorePct?: number
): number {
  const stageMult = getStageMultiplier(defenseStage);
  const stagedDefense = Math.max(1, baseDefense * stageMult);
  const ignore = clamp(defenseIgnorePct ?? 0, 0, 0.95);
  const effective = stagedDefense * (1 - ignore);
  return Math.max(1, Math.floor(effective));
}

const DAMAGE_CONSTANT = 0.2;

export function computeDamage(
  attackerAttack: number,
  attackStage: number,
  defenderDefense: number,
  defenseStage: number,
  movePower: number,
  isCrit: boolean,
  defenseIgnorePct?: number
): number {
  const attackMult = getStageMultiplier(attackStage);
  const effectiveAttack = Math.max(1, attackerAttack * attackMult);
  const effectiveDefense = computeEffectiveDefense(
    defenderDefense,
    defenseStage,
    defenseIgnorePct
  );

  let raw =
    (effectiveAttack / effectiveDefense) * movePower * 0.3 + DAMAGE_CONSTANT;
  if (isCrit) raw *= CRIT_MULTIPLIER;
  const dmg = Math.max(1, Math.floor(raw));
  return dmg;
}

export function applyHpCost(
  currentHp: number,
  cost?: number
): { hp: number; fainted: boolean } {
  if (!cost || cost <= 0) return { hp: currentHp, fainted: false };
  const hp = Math.max(0, currentHp - Math.floor(cost));
  return { hp, fainted: hp <= 0 };
}

export function applyRecoil(
  currentHp: number,
  recoil?: number
): { hp: number; fainted: boolean } {
  if (!recoil || recoil <= 0) return { hp: currentHp, fainted: false };
  const hp = Math.max(0, currentHp - Math.floor(recoil));
  return { hp, fainted: hp <= 0 };
}

export function applyHeal(
  currentHp: number,
  maxHp: number,
  heal?: number
): { hp: number; fainted: boolean } {
  if (!heal || heal <= 0) return { hp: currentHp, fainted: false };
  const hp = Math.min(currentHp + Math.floor(heal), maxHp);
  return { hp, fainted: hp <= 0 };
}

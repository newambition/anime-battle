import type { Move, MoveEffect } from '../data/battleData';
import type {
  ActorSide,
  BattleCharacter,
  BattleEvent,
  RNG,
  StatStages,
} from './battleTypes';
import { clamp, clampStage } from './battleMath';

type NormalizedEffect = {
  type: MoveEffect;
  value?: number;
  chance?: number;
  turns?: number;
};

const DEFAULT_PARALYZE_CHANCE = 0.25;
const DEFAULT_FREEZE_CHANCE = 0.1;

export function normalizeMoveEffects(move: Move): NormalizedEffect[] {
  if (move.effects && move.effects.length > 0) {
    return move.effects.map((e) => ({ ...e }));
  }
  if (move.effect) {
    return [
      {
        type: move.effect,
        value: move.value,
        chance: move.chance,
        turns: move.turns,
      },
    ];
  }
  return [];
}

function applyStageDelta(
  stages: StatStages,
  stat: keyof StatStages,
  delta: number
): StatStages {
  const next = { ...stages };
  next[stat] = clampStage((next[stat] ?? 0) + delta);
  return next;
}

export function applyStatChanges(
  actor: BattleCharacter,
  move: Move,
  side: ActorSide
): { actor: BattleCharacter; events: BattleEvent[] } {
  const effects = normalizeMoveEffects(move);
  let updated = actor;
  const events: BattleEvent[] = [];

  for (const eff of effects) {
    const value = eff.value ?? move.value ?? 0;
    if (value === 0) continue;

    let stat: keyof StatStages | null = null;
    let delta = 0;

    switch (eff.type) {
      case 'attack_up':
        stat = 'attack';
        delta = value;
        break;
      case 'defense_up':
        stat = 'defense';
        delta = value;
        break;
      case 'accuracy_up':
        stat = 'accuracy';
        delta = value;
        break;
      case 'self_defense_down':
        stat = 'defense';
        delta = -Math.abs(value);
        break;
    }

    if (stat) {
      const stages = applyStageDelta(updated.stages, stat, delta);
      updated = { ...updated, stages };
      events.push({
        type: 'stat_change',
        side,
        stat,
        change: delta,
        newStage: stages[stat],
      });
    }
  }

  return { actor: updated, events };
}

export function applyEnemyDebuffs(
  target: BattleCharacter,
  move: Move,
  targetSide: ActorSide
): { target: BattleCharacter; events: BattleEvent[] } {
  const effects = normalizeMoveEffects(move);
  let updated = target;
  const events: BattleEvent[] = [];

  for (const eff of effects) {
    const value = eff.value ?? move.value ?? 0;
    if (value === 0) continue;

    let stat: keyof StatStages | null = null;
    let delta = 0;

    switch (eff.type) {
      case 'enemy_attack_down':
        stat = 'attack';
        delta = -Math.abs(value);
        break;
      case 'enemy_defense_down':
        stat = 'defense';
        delta = -Math.abs(value);
        break;
      case 'accuracy_down':
        stat = 'accuracy';
        delta = -Math.abs(value);
        break;
    }

    if (stat) {
      const stages = applyStageDelta(updated.stages, stat, delta);
      updated = { ...updated, stages };
      events.push({
        type: 'stat_change',
        side: targetSide,
        stat,
        change: delta,
        newStage: stages[stat],
      });
    }
  }

  return { target: updated, events };
}

export function applyStatuses(
  actor: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  side: ActorSide,
  targetSide: ActorSide,
  hitLanded: boolean,
  rng: RNG = Math.random
): { actor: BattleCharacter; target: BattleCharacter; events: BattleEvent[] } {
  const effects = normalizeMoveEffects(move);
  let updatedActor = actor;
  let updatedTarget = target;
  const events: BattleEvent[] = [];

  for (const eff of effects) {
    switch (eff.type) {
      case 'invulnerable': {
        const addTurns = eff.turns ?? move.turns ?? 1;
        const turns = Math.max(
          updatedActor.status.invulnerableTurns ?? 0,
          addTurns
        );
        updatedActor = {
          ...updatedActor,
          status: { ...updatedActor.status, invulnerableTurns: turns },
        };
        events.push({
          type: 'status_applied',
          side,
          target: side,
          status: 'invulnerable',
          turns,
        });
        break;
      }
      case 'heal': {
        const raw = eff.value ?? move.value ?? 0;
        if (raw > 0) {
          const amount = Math.floor(raw);
          const newHp = clamp(updatedActor.hp + amount, 0, updatedActor.maxHp);
          updatedActor = { ...updatedActor, hp: newHp };
          events.push({ type: 'heal', side, amount, newHp });
        }
        break;
      }
      case 'paralyze': {
        if (hitLanded) {
          const chance = eff.chance ?? move.chance ?? DEFAULT_PARALYZE_CHANCE;
          if (rng() < chance) {
            updatedTarget = {
              ...updatedTarget,
              status: { ...updatedTarget.status, paralyze: true },
            };
            events.push({
              type: 'status_applied',
              side,
              target: targetSide,
              status: 'paralyze',
              chance,
            });
          }
        }
        break;
      }
      case 'freeze': {
        if (hitLanded) {
          const chance = eff.chance ?? move.chance ?? DEFAULT_FREEZE_CHANCE;
          if (rng() < chance) {
            updatedTarget = {
              ...updatedTarget,
              status: { ...updatedTarget.status, freeze: true },
            };
            events.push({
              type: 'status_applied',
              side,
              target: targetSide,
              status: 'freeze',
              chance,
            });
          }
        }
        break;
      }
      default:
        // Other types are handled by buff/debuff functions or core math
        break;
    }
  }

  return { actor: updatedActor, target: updatedTarget, events };
}

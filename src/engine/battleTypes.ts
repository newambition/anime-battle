import type { Character, Move } from '../data/battleData';

// Sides/turns
export type ActorSide = 'player' | 'opponent';

// Stat stages (−6..+6)
export type StatName = 'attack' | 'defense' | 'accuracy' | 'hp';

export interface StatStages {
  attack: number;
  defense: number;
  accuracy: number;
  hp: number;
}

// Status flags and durations
export interface StatusState {
  paralyze?: boolean;
  freeze?: boolean;
  // Remaining turns of invulnerability. When 0 or undefined, actor is vulnerable
  invulnerableTurns?: number;
}

// Character state during battle
export interface BattleCharacter extends Character {
  // Max HP snapshot at battle start
  maxHp: number;
  // Keep base stats to compute from stages; do not mutate these
  baseAttack: number;
  baseDefense: number;
  // Stages and status for this actor
  stages: StatStages;
  status: StatusState;
}

export interface ChargeState {
  moveId: string;
  turnsLeft: number;
}

export interface BattleState {
  player: BattleCharacter;
  opponent: BattleCharacter;
  playerCharge: ChargeState | null;
  opponentCharge: ChargeState | null;
  turn: ActorSide;
}

// Structured events for UI logging/telemetry
export type BattleEvent =
  | { type: 'turn_start'; side: ActorSide }
  | { type: 'move_selected'; side: ActorSide; moveId: string; moveName: string }
  | {
      type: 'hp_cost_paid';
      side: ActorSide;
      amount: number;
      remainingHp: number;
    }
  | {
      type: 'status_blocked';
      side: ActorSide;
      status: 'paralyze' | 'freeze';
      thawed?: boolean;
    }
  | { type: 'charge_started'; side: ActorSide; moveId: string; turns: number }
  | { type: 'charge_ticked'; side: ActorSide; moveId: string }
  | { type: 'charge_released'; side: ActorSide; moveId: string }
  | { type: 'accuracy_check'; side: ActorSide; accuracy: number; hit: boolean }
  | { type: 'miss'; side: ActorSide }
  | { type: 'crit'; side: ActorSide }
  | {
      type: 'damage';
      side: ActorSide; // attacker
      target: ActorSide; // victim
      amount: number;
      remainingHp: number;
      hitIndex?: number; // for multi-hit
      totalHits?: number;
    }
  | { type: 'invulnerable_block'; side: ActorSide; target: ActorSide }
  | {
      type: 'stat_change';
      side: ActorSide;
      stat: StatName;
      change: number; // delta
      newStage: number;
    }
  | {
      type: 'status_applied';
      side: ActorSide; // applier
      target: ActorSide; // recipient
      status: 'paralyze' | 'freeze' | 'invulnerable';
      turns?: number;
      chance?: number;
    }
  | { type: 'heal'; side: ActorSide; amount: number; newHp: number }
  | { type: 'heal_blocked'; side: ActorSide }
  | { type: 'recoil'; side: ActorSide; amount: number; newHp: number }
  | { type: 'faint'; side: ActorSide }
  | { type: 'turn_end'; side: ActorSide };

export type RNG = () => number;

export interface PendingActionRelease {
  side: ActorSide;
  move: Move;
}

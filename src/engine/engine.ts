import type { Character, Move } from '../data/battleData';
import {
  type ActorSide,
  type BattleCharacter,
  type BattleEvent,
  type BattleState,
  type RNG,
} from './battleTypes';
import {
  applyAccuracyStages,
  applyHpCost,
  applyRecoil,
  computeDamage,
  rollCrit,
  rollHit,
} from './battleMath';
import {
  applyEnemyDebuffs,
  applyStatChanges,
  applyStatuses,
  normalizeMoveEffects,
} from './effects';
import {
  getCharge,
  maybeReleaseCharge,
  maybeStartCharge,
  tickCharge,
} from './charge';

function otherSide(side: ActorSide): ActorSide {
  return side === 'player' ? 'opponent' : 'player';
}

export function createBattleCharacter(character: Character): BattleCharacter {
  return {
    ...character,
    maxHp: character.hp,
    baseAttack: character.attack,
    baseDefense: character.defense,
    stages: { attack: 0, defense: 0, accuracy: 0 },
    status: {},
  };
}

export function initializeBattleState(
  player: Character,
  opponent: Character
): BattleState {
  return {
    player: createBattleCharacter(player),
    opponent: createBattleCharacter(opponent),
    playerCharge: null,
    opponentCharge: null,
    turn: 'player',
  };
}

function resolveMoveFromActor(
  actor: BattleCharacter,
  moveId?: string
): Move | undefined {
  if (!moveId) return undefined;
  return actor.moves.find((m) => m.id === moveId);
}

export function takeTurn(
  state: BattleState,
  side: ActorSide,
  chosenMoveId?: string,
  rng: RNG = Math.random
): { state: BattleState; events: BattleEvent[] } {
  const events: BattleEvent[] = [{ type: 'turn_start', side }];

  const actor = side === 'player' ? state.player : state.opponent;

  // Handle existing charge countdown for this side
  const ticked = tickCharge(state, side);
  state = ticked.state;

  // If still charging, end turn
  const charge = getCharge(state, side);
  if (charge && charge.turnsLeft > 0) {
    events.push({ type: 'charge_ticked', side, moveId: charge.moveId });
    return {
      state: { ...state, turn: otherSide(side) },
      events: [...events, { type: 'turn_end', side }],
    };
  }

  // If charge just finished, auto-release
  const released = maybeReleaseCharge(state, side, (id) =>
    resolveMoveFromActor(actor, id)
  );
  state = released.state;
  const chargeReleasedMove = released.move;
  if (released.events.length) events.push(...released.events);

  let move: Move | undefined = chargeReleasedMove ?? undefined;
  if (!move) {
    // No release; use chosen move
    move = resolveMoveFromActor(actor, chosenMoveId);
    if (!move) {
      // No move selected; end turn
      return {
        state: { ...state, turn: otherSide(side) },
        events: [...events, { type: 'turn_end', side }],
      };
    }

    // If move has charge and no charge pending, start it and end turn (no costs, no accuracy/damage yet)
    if ((move.chargeTurns ?? 0) > 0 && !getCharge(state, side)) {
      const started = maybeStartCharge(state, side, move);
      state = started.state;
      if (started.events.length) events.push(...started.events);
      return {
        state: { ...state, turn: otherSide(side) },
        events: [...events, { type: 'turn_end', side }],
      };
    }
  }

  // Pay HP cost up-front (per plan), even if status blocks afterward
  if (move.hpCost && move.hpCost > 0) {
    const cost = applyHpCost(actor.hp, move.hpCost);
    const nextActor: BattleCharacter = { ...actor, hp: cost.hp };
    if (side === 'player') state = { ...state, player: nextActor };
    else state = { ...state, opponent: nextActor };
    events.push({
      type: 'hp_cost_paid',
      side,
      amount: Math.floor(move.hpCost),
      remainingHp: cost.hp,
    });
    if (cost.fainted) {
      events.push({ type: 'faint', side });
      return {
        state: { ...state, turn: otherSide(side) },
        events: [...events, { type: 'turn_end', side }],
      };
    }
  }

  // Status gating: paralyze/freeze
  // Paralyze gate: 25% default chance to be unable to act
  if (actor.status.paralyze) {
    const blocked = rng() < 0.25;
    if (blocked) {
      events.push({ type: 'status_blocked', side, status: 'paralyze' });
      return {
        state: { ...state, turn: otherSide(side) },
        events: [...events, { type: 'turn_end', side }],
      };
    }
  }

  // Freeze gate: if frozen, try thaw (20% chance) else blocked
  if (actor.status.freeze) {
    const thawed = rng() < 0.2;
    if (thawed) {
      const nextActor: BattleCharacter = {
        ...actor,
        status: { ...actor.status, freeze: false },
      };
      if (side === 'player') state = { ...state, player: nextActor };
      else state = { ...state, opponent: nextActor };
      events.push({
        type: 'status_blocked',
        side,
        status: 'freeze',
        thawed: true,
      });
    } else {
      events.push({ type: 'status_blocked', side, status: 'freeze' });
      return {
        state: { ...state, turn: otherSide(side) },
        events: [...events, { type: 'turn_end', side }],
      };
    }
  }

  // Self-only instant effects (no accuracy needed)
  const effects = normalizeMoveEffects(move);
  const selfOnlyTypes = new Set([
    'attack_up',
    'defense_up',
    'accuracy_up',
    'invulnerable',
    'heal',
    'self_defense_down',
  ]);
  const containsOnlySelfEffects =
    effects.length > 0 && effects.every((e) => selfOnlyTypes.has(e.type));

  if (containsOnlySelfEffects) {
    // Apply self buffs and penalties
    const statChanges = applyStatChanges(
      side === 'player' ? state.player : state.opponent,
      move,
      side
    );
    if (side === 'player') state = { ...state, player: statChanges.actor };
    else state = { ...state, opponent: statChanges.actor };
    if (statChanges.events.length) events.push(...statChanges.events);

    // Statuses that apply to self (invulnerable, heal) handled in applyStatuses
    const selfStatuses = applyStatuses(
      side === 'player' ? state.player : state.opponent,
      side === 'player' ? state.opponent : state.player,
      move,
      side,
      otherSide(side),
      false,
      rng
    );
    state = {
      ...state,
      player: side === 'player' ? selfStatuses.actor : selfStatuses.target,
      opponent: side === 'player' ? selfStatuses.target : selfStatuses.actor,
    };
    if (selfStatuses.events.length) events.push(...selfStatuses.events);

    return {
      state: { ...state, turn: otherSide(side) },
      events: [...events, { type: 'turn_end', side }],
    };
  }

  // Accuracy roll (attacker accuracy stages)
  const attacker = side === 'player' ? state.player : state.opponent;
  const defender = side === 'player' ? state.opponent : state.player;

  const adjustedAccuracy = applyAccuracyStages(
    move.accuracy,
    attacker.stages.accuracy
  );
  const hit = rollHit(adjustedAccuracy, rng);
  events.push({
    type: 'accuracy_check',
    side,
    accuracy: adjustedAccuracy,
    hit,
  });
  if (!hit) {
    events.push({ type: 'miss', side });
    return {
      state: { ...state, turn: otherSide(side) },
      events: [...events, { type: 'turn_end', side }],
    };
  }

  // Determine crit and defense-ignore
  const isHighCrit = Boolean(
    move.highCritChance || effects.some((e) => e.type === 'highCritChance')
  );
  const isCrit = rollCrit(isHighCrit, rng);
  if (isCrit) events.push({ type: 'crit', side });

  const defenseIgnoreEff = effects.find((e) => e.type === 'defense_ignore');
  const defenseIgnorePct = defenseIgnoreEff?.value;

  let remainingHpTarget = defender.hp;
  let remainingHpActor = attacker.hp;
  let atLeastOneDamageHit = false;
  const totalHits = Math.max(1, Math.floor(move.hits ?? 1));

  for (let i = 0; i < totalHits; i += 1) {
    // Invulnerable blocks damage
    if ((defender.status.invulnerableTurns ?? 0) > 0 && move.power > 0) {
      events.push({
        type: 'invulnerable_block',
        side,
        target: otherSide(side),
      });
      continue;
    }

    if (move.power > 0) {
      const dmg = computeDamage(
        attacker.baseAttack,
        attacker.stages.attack,
        defender.baseDefense,
        defender.stages.defense,
        move.power,
        isCrit,
        defenseIgnorePct
      );
      remainingHpTarget = Math.max(0, remainingHpTarget - dmg);
      atLeastOneDamageHit = atLeastOneDamageHit || dmg > 0;
      events.push({
        type: 'damage',
        side,
        target: otherSide(side),
        amount: dmg,
        remainingHp: remainingHpTarget,
        hitIndex: totalHits > 1 ? i + 1 : undefined,
        totalHits: totalHits > 1 ? totalHits : undefined,
      });
      if (remainingHpTarget === 0) break;
    }
  }

  // Commit target HP update
  const updatedDefender: BattleCharacter = {
    ...defender,
    hp: remainingHpTarget,
  };
  state =
    side === 'player'
      ? { ...state, opponent: updatedDefender }
      : { ...state, player: updatedDefender };

  // Apply on-hit debuffs/statuses to target if at least one hit occurred (for status effects that require hit)
  const hitLanded =
    hit &&
    (move.power > 0 ||
      effects.some(
        (e) =>
          e.type !== 'attack_up' &&
          e.type !== 'defense_up' &&
          e.type !== 'accuracy_up' &&
          e.type !== 'invulnerable' &&
          e.type !== 'heal' &&
          e.type !== 'self_defense_down'
      ));

  const debuffed = applyEnemyDebuffs(
    side === 'player' ? state.opponent : state.player,
    move,
    side,
    otherSide(side)
  );
  state =
    side === 'player'
      ? { ...state, opponent: debuffed.target }
      : { ...state, player: debuffed.target };
  if (debuffed.events.length && hitLanded) events.push(...debuffed.events);

  const statuses = applyStatuses(
    side === 'player' ? state.player : state.opponent,
    side === 'player' ? state.opponent : state.player,
    move,
    side,
    otherSide(side),
    hitLanded,
    rng
  );
  state = {
    ...state,
    player: side === 'player' ? statuses.actor : statuses.target,
    opponent: side === 'player' ? statuses.target : statuses.actor,
  };
  if (statuses.events.length) events.push(...statuses.events);

  // Recoil after at least one damaging hit
  if (atLeastOneDamageHit && move.recoilDamage && move.recoilDamage > 0) {
    const result = applyRecoil(attacker.hp, move.recoilDamage);
    remainingHpActor = result.hp;
    const newActor: BattleCharacter = { ...attacker, hp: remainingHpActor };
    state =
      side === 'player'
        ? { ...state, player: newActor }
        : { ...state, opponent: newActor };
    events.push({
      type: 'recoil',
      side,
      amount: Math.floor(move.recoilDamage),
      newHp: result.hp,
    });
    if (result.fainted) events.push({ type: 'faint', side });
  }

  // KO checks for defender
  if (remainingHpTarget === 0) {
    events.push({ type: 'faint', side: otherSide(side) });
  }

  // End turn
  return {
    state: { ...state, turn: otherSide(side) },
    events: [...events, { type: 'turn_end', side }],
  };
}

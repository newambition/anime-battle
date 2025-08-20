## Battle Moves Integration Plan

This document defines a complete, stepwise plan to integrate the new move effects and mechanics described in `docs/effectsMechanics.md` into the game logic. The characters and moves list will remain unchanged. Missing `sprite` values are ignored per instruction.

### Strategy Revision (2025-08-20)

After an initial attempt at Phase 2 resulted in critical bugs, this plan has been revised to be more incremental and cautious. The primary changes are:

1.  **Phased UI Integration:** Instead of replacing all UI logic at once, the engine will be integrated one turn at a time (player first, then opponent) to isolate potential issues.
2.  **Scoped Effects:** To ensure a stable foundation, the initial integration will focus on a small set of "Core Effects." More complex effects (`charge`, `invulnerable`, `freeze`, `paralyze`) will be deferred until the core mechanics are proven stable.

**Core Effects for Initial Implementation:**

- **Simple Damage:** Standard power/accuracy moves.
- **Stat Buff (Self):** e.g., `defense_up`.
- **Stat Debuff (Enemy):** e.g., `enemy_defense_down`.
- **HP Cost:** Moves that consume user HP.
- **Recoil:** Moves that cause recoil damage.
- **Multi-hit:** Moves that hit multiple times.

---

Constraints and goals

- The list of characters and moves (IDs, names, powers, accuracies, costs/values) must remain unchanged.
- Effects are integrated faithfully to `docs/effectsMechanics.md`.
- Backward-compatible, minimal edits per step; isolated, reversible where practical.
- Prefer pure, testable helpers for math and effect resolution.

Assumptions and defaults (tunable later)

- Stat stages range: −6..+6, initial 0.
- Stage multipliers (attack/defense): stage ≥ 0 → 1 + 0.5 × stage; stage < 0 → 1 / (1 + 0.5 × |stage|). Clamp result to [0.25, 4.0].
- Accuracy stages: same formula applied to accuracy, then clamp overall accuracy to [0.1, 1.0].
- Crit: base 10% (0.10). High crit chance: 30% (0.30). Crit multiplier: ×1.5 damage.
- Paralyze: 25% chance to be unable to act each turn (checked at action time).
- Freeze: Cannot act. 20% thaw chance checked at action time each turn; if thawed, can act immediately.
- Invulnerable: Negates damage while active; non-damage effects (like debuffs) still apply only if the move indicates on-hit application. Default: status/debuffs require a hit.
- Defense ignore: Percentage is applied to defender’s effective defense after stages (e.g., ignore 25% means effectiveDefense × (1 − 0.25)).
- Multi-hit: One accuracy roll per move, then apply damage repeatedly for `hits` (each hit can crit based on a single crit roll for simplicity). If any hit brings HP to 0, remaining hits are skipped.
- HP cost: Paid when the move is selected, before accuracy/damage. If it KOs the user, action ends with faint.
- Recoil: Fixed damage to the user after damage is applied (if the move hit at least once).
- Charge: First use spends the turn charging; attack is unleashed automatically after `chargeTurns` on that actor’s next eligible action.

Resolution order (single-turn, no charge pending)

1. Pay HP cost (fail if user faints)
2. Check paralyze/freeze gating (skip if blocked; thaw check for freeze)
3. Apply self-only instant effects that are standalone (e.g., pure buffs with power 0)
4. Accuracy roll (with stage-modified accuracy)
5. If miss: log and end
6. Compute damage per rules (including defense ignore, crit, stages)
7. Apply multi-hit damage and on-hit effects
8. Apply recoil (if at least one hit landed)
9. Check faint conditions

Charge flow

- If `chargeTurns > 0` and no charge is pending: set a charge record and end the turn (no accuracy/damage yet).
- On subsequent turn, if charge pending: release the move automatically, then clear the charge record.

Logging

- Use structured events to capture: start, miss, charge start/release, damage (per hit), crits, buffs/debuffs/status applications, recoil, HP cost, faint, and end-of-turn statuses.

Plan progress

- [x] Phase 0 – Step 0.0: Create `movesPlan.md` (2025-08-20) — Plan document added

---

### Phase 0 – Data and typing readiness

- [x] Phase 0 – Step 0.1: Move typing + data normalization (2025-08-20) — Extended `Move` to support `effects[]` while keeping legacy `effect` fields; normalized composite moves to `effects[]`; duplicate-key TS errors resolved; only missing `sprite` diagnostics remain as expected
  - Description: Extend `Move` typing to support multiple effects while keeping existing fields for backward compatibility. Normalize only the moves with duplicate `effect` keys to use `effects: Array<{ type, value?, chance?, turns? }>` without changing semantics or values.
  - Files: `src/data/battleData.ts`
  - Acceptance: TypeScript duplicate-key errors resolved; no behavioral change yet; characters/moves unchanged except structure for duplicate effects.
  - Risks: None; purely structural.

- [x] Phase 0 – Step 0.2: Stage constants and helpers (2025-08-20) — Added `src/engine/battleMath.ts` with clamp, stage multiplier, and accuracy adjustment helpers; no runtime integration yet
  - Description: Export constants and pure helpers for stage math (clamp, multiplier calculations) for attack, defense, and accuracy. No runtime integration yet.
  - Files: `src/engine/battleMath.ts` (new), optionally re-exports in index.
  - Acceptance: Helpers unit-testable; no impact on UI; type-check passes.
  - Risks: None.

---

### Phase 1 – Battle engine

- [x] Phase 1 – Step 1.1: Battle types and runtime state (2025-08-20) — Added `src/engine/battleTypes.ts` defining battle state, stages/status, charge, and structured events; no behavior changes yet
  - Description: Define canonical battle state types and actor state extensions to track stages, statuses, and charges.
  - Files: `src/engine/battleTypes.ts` (new)
  - Includes:
    - `StatStages`: `{ attack: number; defense: number; accuracy: number }` (−6..+6)
    - `StatusState`: `{ paralyze?: boolean; freeze?: boolean; invulnerableTurns?: number }`
    - `BattleCharacter`: `Character` extended with `{ maxHp: number; hp: number; baseAttack: number; baseDefense: number; stages: StatStages; status: StatusState }`
    - `ChargeState`: `{ moveId: string; turnsLeft: number } | null`
    - `BattleState`: `{ player: BattleCharacter; opponent: BattleCharacter; playerCharge: ChargeState; opponentCharge: ChargeState; turn: 'player' | 'opponent' }`
    - `BattleEvent` union for structured logging
  - Acceptance: Types compile; no behavior changes.
  - Risks: None.

- [x] Phase 1 – Step 1.2: Core battle math (2025-08-20) — Implemented hit/crit rolls, defense-ignore, damage, HP cost, recoil in `src/engine/battleMath.ts`; pure, no UI integration yet
  - Description: Implement pure functions for multipliers, accuracy, crits, defense ignore, damage, multi-hit, recoil, and HP cost.
  - Files: `src/engine/battleMath.ts`
  - Functions:
    - `getStageMultiplier(stage: number): number`
    - `applyAccuracyStages(baseAccuracy: number, stage: number): number` (clamped)
    - `rollHit(accuracy: number, rng = Math.random): boolean`
    - `rollCrit(isHighCrit: boolean, rng = Math.random): boolean`
    - `computeEffectiveDefense(baseDefense: number, defenseStage: number, defenseIgnorePct?: number): number`
    - `computeDamage(attackerAtk: number, atkStage: number, defenderDef: number, defStage: number, movePower: number, crit: boolean, defenseIgnorePct?: number): number`
    - `applyHpCost(userHp: number, cost?: number): { hp: number; fainted: boolean }`
    - `applyRecoil(userHp: number, recoil?: number): { hp: number; fainted: boolean }`
  - Acceptance: Deterministic with injected RNG; unit-testable; no UI impact.
  - Risks: Edge-case clamps.

- [x] Phase 1 – Step 1.3: Effects application (2025-08-20) — Added `src/engine/effects.ts` implementing normalization, self-buffs, self-penalties, enemy debuffs, and statuses (invulnerable, heal, paralyze, freeze); pure helpers only
  - Description: Implement effect resolution for self-buffs, enemy debuffs, statuses, and heals. Effects apply on-hit unless the move is a pure (power 0) self-effect.
  - Files: `src/engine/effects.ts`
  - Functions:
    - `applySelfBuffs(actor, move)` → stages/status updates for `attack_up`, `defense_up`, `accuracy_up`
    - `applySelfPenalties(actor, move)` → `self_defense_down`
    - `applyEnemyDebuffs(target, move)` → `enemy_attack_down`, `enemy_defense_down`, `accuracy_down`
    - `applyStatuses(actor, target, move, hitLanded: boolean, rng)` → `paralyze` (chance), `freeze` (chance), `invulnerable` (turns), `heal` (flat; capped to `maxHp`)
    - Each returns partial updates and `BattleEvent[]`
  - Acceptance: Functions pure (given inputs), do not touch React state; unit-testable.
  - Risks: Chance handling consistency.

- [x] Phase 1 – Step 1.4: Charge system (2025-08-20) — Added `src/engine/charge.ts` with start/tick/release helpers and events; pure and side-effect free
  - Description: Implement helpers to start and release charged moves; integrate with event generation.
  - Files: `src/engine/charge.ts`
  - Functions: `maybeStartCharge`, `maybeReleaseCharge`
  - Acceptance: Correct deferral and auto-release behavior per `chargeTurns`.
  - Risks: Turn coordination.

- [x] Phase 1 – Step 1.5: Engine facade (2025-08-20) — Added `src/engine/engine.ts` implementing `initializeBattleState` and `takeTurn` with charge, gating, accuracy/crit, damage, statuses, debuffs, and recoil; pure with events
  - Description: Provide a single `takeTurn(battleState, actorSide, chosenMoveId?, rng?)` that:
    - Handles status gating (paralyze/freeze), charge start/release, costs, accuracy, damage with hits/crit, recoil, effects, invulnerable, and faint checks.
    - Produces updated `BattleState` and `BattleEvent[]`.
  - Files: `src/engine/engine.ts`
  - Acceptance: No React dependencies; deterministic with injected RNG.
  - Risks: Event ordering.

---

### Phase 2 – Cautious UI Integration

- [x] Phase 2 – Step 2.1 (Revised): Isolate Player Turn Integration
  - Description: Modify `App.tsx` to use the new `takeTurn` engine function _only for the player's turn_. The opponent's turn will remain on the old, simple logic for now. This will allow for validating the engine's core damage and effect logic in isolation.
  - Files: `src/App.tsx`
  - Acceptance: The player can perform all their moves, and the damage/effects on the opponent are calculated correctly by the new engine. The opponent's turn still works (using the old logic).
  - Risks: State management complexity.

- [x] Phase 2 – Step 2.2 (Revised): Isolate Opponent Turn Integration
  - Description: Once the player's turn is confirmed to be working perfectly, switch the opponent's turn to use the new `takeTurn` engine function.
  - Files: `src/App.tsx`
  - Acceptance: The opponent's moves are now calculated by the new engine, and the damage/effects on the player are correct. The game is now fully running on the new engine.
  - Risks: Turn-switching bugs.

- [x] Phase 2 – Step 2.3: Structured battle log display
  - Description: Map `BattleEvent[]` to readable log lines, including charge, misses, crits, statuses, buffs/debuffs, recoil, HP cost, and KOs.
  - Files: `src/components/BattleLog.tsx`, `src/App.tsx`
  - Acceptance: Log clarity improved; ordering matches engine events.
  - Risks: None.

- [ ] Phase 2 – Step 2.4: UI hints for statuses and stages (optional)
  - Description: Visual indicators for paralyze/freeze/invulnerable and simple stage arrows near stats.
  - Files: `src/components/CharacterSprite.tsx`, `src/components/HealthBar.tsx`
  - Acceptance: Non-blocking; can be deferred.
  - Risks: Visual noise.

---

### Phase 3 – Validation

- [x] Phase 3 – Step 3.1: Manual scenario matrix
  - Description: Exercise each of the "Core Effects". Once those are stable, gradually re-introduce and validate the more complex effects.
  - Acceptance: All scenarios produce expected qualitative results; no crashes; logs coherent.
  - Risks: Edge timing (charge + status) interactions.

- [ ] Phase 3 – Step 3.2: Unit tests for pure helpers (optional)
  - Description: Add tests for `battleMath`, `effects`, and `charge` with fixed RNG.
  - Files: `src/engine/__tests__/...`
  - Acceptance: Tests pass locally; CI optional.
  - Risks: Test runner setup if not already present.

---

### Phase 4 – Documentation

- [x] Phase 4 – Step 4.1: Developer notes
  - Description: Document engine architecture, event list, and effect semantics (any deviations or clarifications versus `effectsMechanics.md`).
  - Files: `docs/engine-manual.md` (new), update `docs/effectsMechanics.md` cross-references.
  - Acceptance: Up-to-date docs; onboarding-friendly.
  - Risks: Docs drift over time.

---

### Phase 5 – Architectural Refactor (Future)

- [ ] Phase 5 – Step 5.1: Migrate State to Zustand
  - Description: To improve stability and eliminate `useEffect` complexity, migrate the application state (`battleState`, `gameState`, etc.) from `useState` hooks in `App.tsx` to a centralized Zustand store.
  - Files: `src/App.tsx`, `src/store/battleStore.ts` (new)
  - Acceptance: The game is fully functional using the Zustand store for all state management. The `App.tsx` component is simplified to a view layer that reads from the store.
  - Risks: Requires significant refactoring.

---

Rollback and safety

- Each step is isolated. If validation fails, revert the step’s edits or guard behind flags.
- Avoid changing data shape consumed by components until the integration step that updates those components.

Approval gates

- After each step, request review/approval before proceeding (per working rule).

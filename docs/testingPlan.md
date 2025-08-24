# Comprehensive Testing Plan

This document outlines the strategy for implementing a full testing suite for the anime-battle application. The primary goal is to validate the correctness of the battle engine and the state management logic, prevent regressions, and increase confidence in future development.

The chosen testing framework is **Vitest**, as it offers a modern, fast, and seamless integration with the existing Vite project setup.

---

### Phase 1: Setup and Configuration

- [ ] **Step 1.1: Install Dependencies**
  - Description: Add Vitest, Testing Library, and their dependencies to the project.
  - Command:
    ```bash
    npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
    ```

- [ ] **Step 1.2: Configure Vite and TypeScript**
  - Description: Update `vite.config.ts` to include the Vitest test configuration and `tsconfig.json` to include the necessary types for Testing Library.
  - Files: `vite.config.ts`, `tsconfig.json`
  - **`vite.config.ts` changes:**

    ```typescript
    /// <reference types="vitest" />
    import { defineConfig } from 'vite';
    // ... other imports

    export default defineConfig({
      plugins: [react(), tailwindcss()],
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
      },
    });
    ```

  - **`tsconfig.json` changes:** Add `"vitest/globals"` and `"@testing-library/jest-dom"` to the `compilerOptions.types` array.

- [ ] **Step 1.3: Create Test Setup File**
  - Description: Create a setup file to handle global test configurations, such as extending `expect` with Testing Library's matchers and resetting the Zustand store between tests.
  - Files: `src/test/setup.ts` (new)
  - **`setup.ts` content:**

    ```typescript
    import { expect, afterEach, vi } from 'vitest';
    import { cleanup } from '@testing-library/react';
    import * as matchers from '@testing-library/jest-dom/matchers';
    import useBattleStore from '../store/battleStore';

    // Extend vitest's expect with jest-dom matchers
    expect.extend(matchers);

    // Reset the store's initial state before each test
    const initialStoreState = useBattleStore.getState();

    // Mock timers to control setTimeout
    vi.useFakeTimers();

    afterEach(() => {
      // Clean up JSDOM
      cleanup();
      // Reset store state
      useBattleStore.setState(initialStoreState, true);
      // Clear any mocked timers
      vi.clearAllMocks();
    });
    ```

---

### Phase 2: Unit Tests for the Battle Engine

These tests will validate the pure helper functions in isolation. A mocked Random Number Generator (RNG) will be used to ensure deterministic outcomes.

- [x] **Step 2.1: Test `battleMath.ts`** (`src/engine/battleMath.test.ts`)
  - `getStageMultiplier`: Test with positive, negative, and zero stages to ensure correct multiplier calculation.
  - `computeDamage`:
    - Test a baseline scenario with no stat stages or modifiers.
    - Test with positive attacker and defender stages.
    - Test with negative attacker and defender stages.
    - Test with a critical hit (`isCrit: true`) and verify damage is multiplied.
    - Test with `defenseIgnorePct` and verify damage is increased.
  - `rollHit` / `rollCrit`: Provide a mocked RNG that returns fixed values (e.g., `() => 0.1`) to test both success and failure cases predictably.
  - `applyHpCost` / `applyRecoil`: Test that HP is correctly deducted and that the `fainted` flag is true when HP drops to 0.

- [x] **Step 2.2: Test `effects.ts`** (`src/engine/effects.test.ts`)
  - `normalizeMoveEffects`: Test with a move that has a legacy `effect` and a move with a new `effects` array to ensure both are parsed correctly.
  - `applyStatChanges`: Test a move like "Guard Up" (`defense_up`) and verify the actor's `defense` stage is incremented correctly.
  - `applyEnemyDebuffs`: Test a move that applies `enemy_defense_down` and verify the target's `defense` stage is decremented.
  - `applyStatuses`: Use a mocked RNG to test chance-based statuses like `paralyze`. For example, with a 30% chance, mock the RNG to return `0.2` (should apply) and `0.4` (should not apply).

- [x] **Step 2.3: Test `charge.ts`** (`src/engine/charge.test.ts`)
  - `maybeStartCharge`: Use a chargeable move (like Spirit Bomb) and assert that the actor's charge state is correctly initialized (`turnsLeft: 1`).
  - `tickCharge`: After starting a charge, call `tickCharge` and assert that `turnsLeft` is now 0.
  - `maybeReleaseCharge`: After ticking a charge to 0, call this function and assert that it returns the correct `Move` object and that the actor's charge state is now `null`.

---

### Phase 3: Integration Tests for the Zustand Store

These tests will validate the entire game flow by calling the store's actions and asserting on the resulting state, as described in the `engine-manual.md`.

- [x] **Step 3.1: Test `battleStore.ts` - Core Actions** (`src/store/battleStore.test.ts`)
  - **`startBattle`:**
    - Call `startBattle`.
    - Assert that `battleState` is not null.
    - Assert that `player` and `opponent` objects are correctly initialized with their `maxHp`.
    - Assert that `gameState` is `'player_turn'`.
  - **`restart`:**
    - Call `startBattle`, then `restart`.
    - Assert that `battleState` is `null` and `gameState` is `'selecting'`.
  - **`handleMove` (Full Turn Sequence):**
    - Start a battle.
    - Store the initial player and opponent HP.
    - Call `handleMove` with a simple player attack.
    - Use `await vi.runAllTimersAsync()` to execute all `setTimeout` calls.
    - Assert that the opponent's final HP is less than their initial HP.
    - Assert that the player's final HP is also less than their initial HP (confirming the opponent's counter-attack).
    - Assert that the `gameState` has returned to `'player_turn'`.
    - Assert that the `battleLog` contains messages from both the player's and opponent's turns.

- [ ] **Step 3.2: Test `battleStore.ts` - Specific Move Mechanics** (`src/store/battleStore.test.ts`)
  - **Multi-hit Move:**
    - Start a battle with Luffy (`p006`).
    - Call `handleMove` with "Gum-Gum Gatling" (`m023`).
    - Assert that the battle log contains multiple "Hit X/3" messages.
  - **Charge Move:**
    - Start a battle with Goku (`p004`).
    - Call `handleMove` with "Spirit Bomb" (`m016`).
    - Assert that the `battleState.playerCharge` is not null.
    - Assert that the `gameState` is `'opponent_turn'`.
    - Assert that the opponent's HP has _not_ changed yet.
    - Use `await vi.runAllTimersAsync()` to process the opponent's turn.
    - Call `handleMove` again for the player (with any move, as it should be overridden by the charge release).
    - Assert that the opponent's HP has now taken significant damage from Spirit Bomb.
    - Assert that `battleState.playerCharge` is now `null`.
  - **Recoil/HP Cost Move:**
    - Start a battle with Goku (`p004`).
    - Store his initial HP.
    - Call `handleMove` with "Kaioken" (`m014`).
    - Assert that the player's HP is now `initialHP - 20`.
  - **Game Over Condition:**
    - Manually set the opponent's HP to a low value (e.g., 10) in the store's state.
    - Call `handleMove` with a strong player attack.
    - Assert that the opponent's HP is 0.
    - Assert that the `gameState` is `'game_over'`.
    - Assert that the battle log contains the "You win!" message.

---

### Phase 4: Component Rendering Tests (Optional)

- [ ] **Step 4.1: Basic Component Renders**
  - Description: Simple tests to ensure components render without crashing.
  - Files: `src/components/*.test.tsx`
  - Tests:
    - `HealthBar`: Renders the character's name and HP.
    - `BattleLog`: Renders a list of messages.
    - `CharacterSelect`: Renders the dropdowns and start button.
    - `App`: Renders the `CharacterSelect` screen initially, and the battle screen after the `startBattle` action is called.

# Battle Engine Manual

This document provides a comprehensive overview of the anime-battle game's engine. It is intended for developers who need to understand, maintain, or extend the game's core mechanics, as well as for writing effective tests.

## 1. Core Philosophy

The engine is designed around two key principles:

1.  **Deterministic Logic:** The core game logic is completely deterministic. Given the same initial state, the same sequence of moves, and the same random number generation, the outcome of a battle will always be identical. This is crucial for testing and debugging.
2.  **Event-Driven Architecture:** The engine does not directly manipulate the UI. Instead, it processes a turn and produces an array of `BattleEvent` objects. The UI layer (in `App.tsx`) is responsible for interpreting these events and updating the visual display accordingly. This decouples the game logic from its presentation.

## 2. Architecture Overview

The engine is composed of several modules, each with a distinct responsibility:

- `engine.ts`: The main facade and entry point for the engine.
- `battleTypes.ts`: Defines all the core data structures (`BattleState`, `BattleCharacter`, `BattleEvent`, etc.).
- `battleData.ts`: Contains the static data for all characters and their moves.
- `battleMath.ts`: A collection of pure functions for all mathematical calculations (damage, stat multipliers, accuracy rolls, etc.).
- `effects.ts`: Pure functions for resolving the effects of moves (buffs, debuffs, statuses).
- `charge.ts`: Pure functions for managing the state of multi-turn charge moves.

### Data Flow

The typical data flow for a single turn is as follows:

1.  **UI Interaction:** The user clicks a move button in a component like `App.tsx`.
2.  **Store Action Call:** The UI component calls the relevant action from the `useBattleStore` hook (e.g., `handleMove(move)`).
3.  **Engine Call:** The store action executes the game logic, calling the `takeTurn()` function from `engine.ts` with the current `battleState`.
4.  **State Update:** The action receives the new state and events from the engine. It processes these events into user-friendly log messages and then updates the central store using `set()`.
5.  **UI Re-render:** React components that are subscribed to the store via the `useBattleStore` hook automatically re-render to reflect the new state (updated health bars, new battle log messages, etc.).

## 3. The `takeTurn` Function

`takeTurn` is the heart of the engine. It follows a strict order of operations to resolve a turn:

1.  **Charge Handling:** The engine first ticks down any existing charge on the actor.
    - If the actor is still charging after the tick (i.e., `turnsLeft > 0`), the turn ends immediately.
    - If the charge is complete, the charged move is "released" and becomes the active move for the rest of the turn.
2.  **Move Resolution:** If a charged move wasn't released, the engine uses the `chosenMoveId` to find the move details.
3.  **New Charge Start:** If the chosen move is a charge move (e.g., Spirit Bomb) and the actor isn't already charging, the engine starts the charge and the turn ends. The actual move execution is deferred.
4.  **HP Cost:** Any `hpCost` for the move is paid *before* any other action. If the cost causes the actor to faint, the turn ends.
5.  **Status Gating:** The engine checks for statuses that prevent action.
    - **Paralyze:** 25% chance to be fully paralyzed for the turn.
    - **Freeze:** If frozen, there's a 20% chance to thaw. If the thaw fails, the turn is skipped.
6.  **Self-Only Moves:** The engine checks if the move *only* contains effects that apply to the user (e.g., `attack_up`, `heal`, `invulnerable`). If so, it applies these effects and ends the turn, skipping all accuracy and damage steps.
7.  **Accuracy Roll:** For any move that affects an opponent, the engine calculates the final accuracy (factoring in the attacker's accuracy stages) and performs a roll to see if the move hits. A miss ends the turn.
8.  **Damage & Effect Loop:** If the move hits, the engine proceeds:
    - **Critical Hit:** Rolls for a critical hit (base 5%, or 15% for high-crit moves).
    - **Invulnerability Check:** Checks if the target is invulnerable, which blocks all damage.
    - **Multi-Hit Loop:** For moves with multiple `hits`, the damage and effect logic runs for each hit.
    - **Damage Calculation:** Damage is computed based on attacker's attack, defender's defense (with stat stages), move power, and critical hit status. It also accounts for `defense_ignore` effects.
    - **On-Hit Effects:** After damage, any on-hit effects (`enemy_defense_down`, `paralyze`, `freeze`) are applied to the target.
9.  **Recoil:** If the move caused damage and has `recoilDamage`, the recoil is applied to the attacker.
10. **Faint Checks:** The engine checks for faints on the target (due to damage) and the attacker (due to recoil).
11. **Return:** The function returns the final, updated `BattleState` and a complete array of `BattleEvent` objects describing every step that occurred.

## 4. Writing Tests

Given the engine's design, writing tests is straightforward.

- **Testing Pure Helpers:** The functions in `battleMath.ts`, `effects.ts`, and `charge.ts` are all pure. They can be tested by providing known inputs and asserting that the output is as expected. For functions involving randomness (`rollHit`, `rollCrit`), pass a mocked `rng` function that returns a predictable sequence of numbers.

- **Testing the Store:** With the new architecture, test the game's flow by directly calling the actions on the Zustand store and asserting on the resulting state changes. This allows for testing the entire game loop without needing to simulate UI interactions.

  _Example (Jest/Vitest):_

  ```javascript
  import useBattleStore from '../src/store/battleStore';
  import { CHARACTERS } from '../src/data/battleData';

  test('handleMove action should damage opponent and update state', () => {
    // Set initial state for the test
    useBattleStore.getState().setPlayerChoice('p001'); // Set Kanao
    useBattleStore.getState().setOpponentChoice('e001'); // Set Naruto
    useBattleStore.getState().startBattle();

    const initialState = useBattleStore.getState().battleState;
    // This check is important because startBattle is synchronous but we want to be sure
    expect(initialState).not.toBeNull();

    // Get a move to use
    const playerMove = initialState.player.moves[0]; // Kanao's "Crimson Slash"

    // Call the action
    useBattleStore.getState().handleMove(playerMove);

    // Assert on the new state
    const finalState = useBattleStore.getState().battleState;
    expect(finalState.opponent.hp).toBeLessThan(initialState.opponent.hp);
    expect(useBattleStore.getState().battleLog.length).toBeGreaterThan(1);
  });
  ```

## 5. State Management (Zustand)

The application's state is managed by a centralized Zustand store located at `src/store/battleStore.ts`. This approach was adopted to resolve race conditions and simplify the logic that was previously handled by a complex chain of `useState` and `useEffect` hooks in the main `App.tsx` component.

By using Zustand, we achieve:

- **Centralized State:** A single source of truth for all battle-related data.
- **Decoupled Logic:** The UI components are decoupled from the business logic. They simply read state from the store and dispatch actions.
- **Improved Testability:** The entire game flow can be tested by interacting with the store's actions directly.

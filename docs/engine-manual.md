# Battle Engine Manual

This document provides a comprehensive overview of the anime-battle game's engine. It is intended for developers who need to understand, maintain, or extend the game's core mechanics, as well as for writing effective tests.

## 1. Core Philosophy

The engine is designed around two key principles:

1.  **Deterministic Logic:** The core game logic is completely deterministic. Given the same initial state, the same sequence of moves, and the same random number generation, the outcome of a battle will always be identical. This is crucial for testing and debugging.
2.  **Event-Driven Architecture:** The engine does not directly manipulate the UI. Instead, it processes a turn and produces an array of `BattleEvent` objects. The UI layer (in `App.tsx`) is responsible for interpreting these events and updating the visual display accordingly. This decouples the game logic from its presentation.

## 2. Architecture Overview

The engine is composed of several modules, each with a distinct responsibility:

-   `engine.ts`: The main facade and entry point for the engine.
-   `battleTypes.ts`: Defines all the core data structures (`BattleState`, `BattleCharacter`, `BattleEvent`, etc.).
-   `battleData.ts`: Contains the static data for all characters and their moves.
-   `battleMath.ts`: A collection of pure functions for all mathematical calculations (damage, stat multipliers, accuracy rolls, etc.).
-   `effects.ts`: Pure functions for resolving the effects of moves (buffs, debuffs, statuses).
-   `charge.ts`: Pure functions for managing the state of multi-turn charge moves.

### Data Flow

The typical data flow for a single turn is as follows:

1.  **UI Interaction:** The user clicks a move button in the `App.tsx` component.
2.  **Engine Call:** `App.tsx` calls the `takeTurn()` function from `engine.ts`, passing in the current `battleState`, the side taking the action ('player'), and the chosen `move.id`.
3.  **Turn Processing:** `takeTurn()` executes the entire logic for the turn in a specific, ordered sequence (see *Resolution Order* below).
4.  **State and Events Returned:** `takeTurn()` returns an object containing the new, updated `battleState` and an array of `BattleEvent` objects that occurred during the turn.
5.  **UI Update:** `App.tsx` updates its own state with the new `battleState` and then processes the `events` array to render the appropriate messages in the `BattleLog` component.

## 3. The `takeTurn` Function

`takeTurn` is the heart of the engine. It follows a strict order of operations to resolve a turn:

1.  **Charge Handling:** It first checks if the current actor is charging a move. If a charge is pending but not ready, the turn ends immediately. If a charge is ready, it is released, and that move is used for the turn.
2.  **Move Resolution:** It resolves the chosen move ID to a full `Move` object.
3.  **Cost Application:** It applies any HP costs associated with the move.
4.  **Status Gating:** It checks for statuses like `paralyze` or `freeze` that might prevent the actor from moving.
5.  **Effect Resolution:** It determines if the move is a simple self-buff or a damaging/debuffing move.
6.  **Accuracy Roll:** For non-self-only moves, it calculates the final accuracy (including stat stages) and rolls to see if the move hits.
7.  **Damage Calculation:** If the move hits and has power, it calculates the damage based on stats, stages, and move power. This includes calculating critical hits and defense ignore.
8.  **Effect Application:** It applies any on-hit effects, such as debuffs or statuses, to the target.
9.  **Recoil:** It applies any recoil damage to the attacker.
10. **Faint Check:** It checks if any character's HP has reached zero.
11. **Return:** It returns the final state and the full list of events.

## 4. Writing Tests

Given the engine's design, writing tests is straightforward.

-   **Testing Pure Helpers:** The functions in `battleMath.ts`, `effects.ts`, and `charge.ts` are all pure. They can be tested by providing known inputs and asserting that the output is as expected. For functions involving randomness (`rollHit`, `rollCrit`), you can pass a mocked `rng` function that returns a predictable sequence of numbers.

    *Example (Jest):*
    ```javascript
    import { computeDamage } from './battleMath';

    test('should calculate damage correctly', () => {
      // Attacker: 100 ATK, 0 stages
      // Defender: 80 DEF, 0 stages
      // Move: 90 Power
      const damage = computeDamage(100, 0, 80, 0, 90, false, 0);
      expect(damage).toBe(55); // Or whatever the expected value is
    });
    ```

-   **Testing the Full Turn:** You can test the entire `takeTurn` function by creating an initial `BattleState`, calling `takeTurn` with a specific move, and then inspecting both the resulting `BattleState` and the `BattleEvent` array to ensure the turn resolved as expected.

    *Example (Jest):*
    ```javascript
    import { initializeBattleState, takeTurn } from './engine';
    import { CHARACTERS } from '../data/battleData';

    test('player should damage opponent', () => {
      const initialState = initializeBattleState(CHARACTERS.p001, CHARACTERS.p002);
      const { state: finalState, events } = takeTurn(initialState, 'player', 'm001');

      // Check final state
      expect(finalState.opponent.hp).toBeLessThan(initialState.opponent.hp);

      // Check events
      const damageEvent = events.find(e => e.type === 'damage');
      expect(damageEvent).toBeDefined();
      expect(damageEvent.target).toBe('opponent');
    });
    ```

## 5. Future Architecture (Zustand)

As documented in `docs/movesPlan.md`, the current state management in `App.tsx` using `useState` and `useEffect` is functional but has proven to be a source of bugs. The next major architectural improvement will be to migrate the application's state management to **Zustand**. This will centralize the `battleState` and all related actions (like `handleMove`) into a store, decoupling the core logic from the UI and eliminating complex `useEffect` dependencies.

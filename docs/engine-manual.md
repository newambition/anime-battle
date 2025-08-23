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

- **Testing Pure Helpers:** The functions in `battleMath.ts`, `effects.ts`, and `charge.ts` are all pure. They can be tested by providing known inputs and asserting that the output is as expected. For functions involving randomness (`rollHit`, `rollCrit`), pass a mocked `rng` function that returns a predictable sequence of numbers.

- **Testing the Store:** With the new architecture, test the game's flow by directly calling the actions on the Zustand store and asserting on the resulting state changes. This allows for testing the entire game loop without needing to simulate UI interactions.

  _Example (Jest/Vitest):_

  ```javascript
  import useBattleStore from '../src/store/battleStore';
  import { CHARACTERS } from '../src/data/battleData';

  test('handleMove action should damage opponent and update state', () => {
    // Set initial state for the test
    useBattleStore.getState().startBattle(); // Assuming default characters
    const initialState = useBattleStore.getState().battleState;

    // Get a move to use
    const playerMove = initialState.player.moves[0];

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

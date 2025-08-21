# Zustand State Management Migration Plan

This document outlines the strategy and steps for refactoring the application's state management from React's built-in `useState` and `useEffect` hooks to Zustand. This migration is the final planned architectural step to enhance stability, simplify the component hierarchy, and improve the overall developer experience.

### Strategy Revision (2025-08-20)

The current implementation in `App.tsx` has proven that managing complex, asynchronous turn-based logic with `useEffect` is prone to race conditions and becomes difficult to reason about as features are added. Migrating to a centralized state management library like Zustand will resolve these issues by collocating state and the actions that modify it, while decoupling the UI from the business logic.

**Core Goals:**

1.  **Centralize State:** Consolidate all application state (`gameState`, `battleState`, `battleLog`, etc.) into a single, accessible Zustand store.
2.  **Simplify `App.tsx`:** Transform the main `App` component into a lean view layer that primarily reads from the store and dispatches actions.
3.  **Eliminate `useEffect` for Logic:** Remove the complex `useEffect` hook responsible for sequencing the opponent's turn, moving this asynchronous logic into the store's actions.
4.  **Improve Robustness:** Create a more predictable and debuggable state flow, eliminating the risk of bugs caused by stale state or dependency array issues.

---

### Phase 1 – Store Definition and Implementation

- [ ] **Step 1.1: Create the Battle Store**
  - Description: Create a new file `src/store/battleStore.ts`. This file will define the shape of our state and the actions that can be performed on it.
  - Files: `src/store/battleStore.ts` (new)
  - **Store State Interface (`BattleStoreState`):**

    ```typescript
    import { BattleState, BattleEvent } from '../engine/battleTypes';
    import { Character, Move } from '../data/battleData';

    type GameStatus =
      | 'selecting'
      | 'player_turn'
      | 'opponent_turn'
      | 'animating'
      | 'game_over';

    interface BattleStoreState {
      gameState: GameStatus;
      battleState: BattleState | null;
      battleLog: string[];
      playerChoiceId: string;
      opponentChoiceId: string;

      // Derived state for convenience
      player: (BattleCharacter & { maxHp: number }) | null;
      opponent: (BattleCharacter & { maxHp: number }) | null;
    }
    ```

  - **Store Actions Interface (`BattleStoreActions`):**
    ```typescript
    interface BattleStoreActions {
      setPlayerChoice: (id: string) => void;
      setOpponentChoice: (id: string) => void;
      startBattle: () => void;
      handleMove: (move: Move) => void;
      restart: () => void;
    }
    ```
  - Acceptance: The store file is created with the correct types and a basic Zustand `create` implementation. No runtime integration yet.
  - Risks: None.

- [ ] **Step 1.2: Implement Store Logic**
  - Description: Port all state-mutating logic from `App.tsx` into the actions of the `battleStore`. This includes the logic for starting a battle, handling the player's move, and crucially, managing the timeout and execution for the opponent's turn.
  - Files: `src/store/battleStore.ts`
  - **Implementation Details:**
    - The `startBattle` action will use `get()` to read `playerChoiceId` and `opponentChoiceId`, call the `initializeBattleState` engine function, and use `set()` to update the `battleState`, `gameState`, and `battleLog`.
    - The `handleMove` action will be asynchronous. It will:
      1.  Call the `takeTurn` engine function for the player.
      2.  Update the state with the results, checking for a `faint` event to set `gameState` to `game_over`.
      3.  If the game is not over, use a `setTimeout` (wrapped in a Promise) to create the delay.
      4.  After the delay, it will calculate and execute the opponent's turn.
      5.  Update the state again with the opponent's turn results, again checking for a `faint` event to set `gameState` to `game_over`.
    - The `restart` action will reset all state properties to their initial values.
  - Acceptance: All game logic is encapsulated within the store's actions. The store is self-contained and manages the entire game flow.
  - Risks: Correctly handling the asynchronous nature of the opponent's turn within a Zustand action is critical.

---

### Phase 2 – UI Refactoring

- [ ] **Step 2.1: Refactor `App.tsx` to Use the Store**
  - Description: Strip all `useState` and `useEffect` hooks related to game logic from `App.tsx`. Replace them with a single `useBattleStore` hook to select the necessary state and actions.
  - Files: `src/App.tsx`
  - **Refactoring Steps:**
    1.  Import `useBattleStore` from `src/store/battleStore.ts`.
    2.  Select all required state slices: `const { gameState, player, opponent, battleLog, handleMove, restart } = useBattleStore();`
    3.  Connect the UI event handlers directly to the store's actions (e.g., `<button onClick={() => handleMove(move)}>`).
    4.  Remove the `processEvents` helper function from the component, as this logic will now live within the store's actions.
  - Acceptance: `App.tsx` is now a "dumb" component. It contains no business logic and only renders the UI based on the state provided by the `useBattleStore` hook. All `useState` and `useEffect` hooks for game flow are gone.
  - Risks: Ensuring all components re-render correctly when their specific state slices change.

- [ ] **Step 2.2: Refactor `CharacterSelect.tsx`**
  - Description: Update the character selection component to read its values from and send its updates to the Zustand store, removing the need for prop drilling from `App.tsx`.
  - Files: `src/components/CharacterSelect.tsx`
  - **Refactoring Steps:**
    1.  Import `useBattleStore`.
    2.  Select the required state and actions: `const { playerChoiceId, opponentChoiceId, setPlayerChoice, setOpponentChoice, startBattle } = useBattleStore();`
    3.  Remove the props (`onChangePlayer`, `onChangeOpponent`, etc.) and connect the `select` elements' `onChange` handlers directly to the `setPlayerChoice` and `setOpponentChoice` actions.
  - Acceptance: The `CharacterSelect` component is fully decoupled from `App.tsx` and manages its state via the central store.
  - Risks: None; this is a straightforward refactor.

---

### Phase 3 – Validation and Cleanup

- [ ] **Step 3.1: Full Manual Test**
  - Description: Perform a complete playthrough of the game, testing multiple character matchups and all available moves.
  - Acceptance: The game is fully functional and behaves identically to the pre-refactor version. There are no console errors or warnings related to state updates. The turn-based flow is stable and correct.
  - Risks: Uncovering edge cases in the asynchronous turn logic.

- [ ] **Step 3.2: Code Cleanup**
  - Description: Remove any unused props, helper functions, or state variables from the component files. Ensure all types are correctly imported and used.
  - Files: `src/App.tsx`, `src/components/*`
  - Acceptance: The codebase is clean, and all remnants of the old state management system have been removed.
  - Risks: None.

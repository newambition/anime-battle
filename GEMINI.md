# GEMINI.md: Anime Battle

## Project Overview

This project is a turn-based battle game featuring popular anime characters. The game is built using React, TypeScript, and Vite, with Tailwind CSS for styling. The core gameplay involves selecting a character and an opponent, and then taking turns to attack, defend, and use special moves until one character's health points (HP) reach zero.

The project is structured as follows:

-   `src/`: Contains the main source code for the application.
-   `src/components/`: Reusable React components for the UI, such as health bars, battle logs, and character sprites.
-   `src/data/`: Contains the game's data, including character stats and move sets.
-   `src/engine/`: The core battle logic, which is a state machine that processes turns and calculates battle outcomes.
-   `public/`: Static assets, such as images and icons.
-   `docs/`: Project documentation.

## Battle Engine

The battle engine is the core of the game, handling all game logic and state management.

### Core Philosophy

The engine is designed around two key principles:

1.  **Deterministic Logic:** The core game logic is completely deterministic. Given the same initial state, the same sequence of moves, and the same random number generation, the outcome of a battle will always be identical.
2.  **Event-Driven Architecture:** The engine produces an array of `BattleEvent` objects, which the UI layer uses to update the display. This decouples the game logic from its presentation.

### Architecture

The engine is composed of several modules:

-   `engine.ts`: The main facade and entry point for the engine.
-   `battleTypes.ts`: Defines all the core data structures.
-   `battleData.ts`: Contains the static data for all characters and their moves.
-   `battleMath.ts`: Pure functions for all mathematical calculations.
-   `effects.ts`: Pure functions for resolving the effects of moves.
-   `charge.ts`: Pure functions for managing the state of multi-turn charge moves.

### The `takeTurn` Function

`takeTurn` is the heart of the engine and follows a strict order of operations to resolve a turn, including charge handling, move resolution, cost application, status gating, accuracy rolls, damage calculation, and effect application.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```
4.  **Lint the code:**
    ```bash
    npm run lint
    ```
5.  **Preview the production build:**
    ```bash
    npm run preview
    ```

## Development Conventions

### Coding Style

The project uses Prettier for code formatting and ESLint for linting. The configuration files for these tools are `.prettierrc.json` and `eslint.config.js`, respectively. The coding style is based on the official React/TypeScript and Tailwind CSS best practices.

### Testing

The engine's deterministic and modular design makes it highly testable.

-   **Pure Helpers:** Functions in `battleMath.ts`, `effects.ts`, and `charge.ts` can be tested with known inputs.
-   **Full Turn:** The `takeTurn` function can be tested by providing an initial `BattleState` and inspecting the final state and the emitted `BattleEvent` array.

Although the architecture supports it, there are currently no testing frameworks set up in this project.

### Future Architecture (Zustand)

The current state management in `App.tsx` using `useState` and `useEffect` is functional but has proven to be a source of bugs. The next major architectural improvement will be to migrate the application's state management to **Zustand**.

### Contribution Guidelines

There are no contribution guidelines in this project.

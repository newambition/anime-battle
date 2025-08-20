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

There are no testing frameworks set up in this project.

### Contribution Guidelines

There are no contribution guidelines in this project.

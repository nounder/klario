# Agent Guidelines for klario

## Tech Stack

- **Framework**: SolidJS with JSX (not React!)
- **Runtime**: Bun (replaces Node.js/npm)
- **Build tool**: Vite with `vite-plugin-solid`
- **TypeScript**: Strict mode enabled with `verbatimModuleSyntax`

## Code Style

- **Formatting**: Use dprint (80 char line width, 2 space indent, ASI - no semicolons)
- **Imports**:
  - Always include `.ts`/`.tsx` extensions.
  - Use type imports with `import type`.
  - Use namespace imports (`import * as Name from "./Name.ts"`) for capitalized local modules
- **Types**: Strict TypeScript.
  - Prefer discriminated unions
  - Use `noUncheckedIndexedAccess`
  - use `type` keyword for type aliases and interfaces
- **Naming**:
  - PascalCase for components/types,
  - camelCase for functions/variables.
- **JSX**: Prefer `style` object prop over className. Use `classList` for conditional classes
- **State**: Use SolidJS `createSignal`/`createStore`, NOT React hooks

## Project Structure

- `src/nodes/`: Canvas node types (drawable elements)
- `src/tools/`: Drawing tools (pen, eraser, text, etc.)
- `src/strokes/`: Stroke rendering and simplification

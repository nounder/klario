# Agent Guidelines for klario

## Build Commands
- **Dev server**: `bun run dev` (uses Vite with Bun runtime)
- **Build**: `bun run build` (production build via Vite)
- **Format**: Use `dprint fmt` to format code (already configured)
- **No tests**: This project currently has no test suite

## Tech Stack
- **Framework**: SolidJS with JSX (not React!)
- **Runtime**: Bun (replaces Node.js/npm)
- **Build tool**: Vite with `vite-plugin-solid`
- **TypeScript**: Strict mode enabled with `verbatimModuleSyntax`

## Code Style
- **Formatting**: Use dprint (80 char line width, 2 space indent, ASI - no semicolons)
- **Imports**: Always include `.ts`/`.tsx` extensions. Use type imports with `import type`. Use namespace imports (`import * as Name from "./Name.ts"`) for capitalized local modules
- **Types**: Strict TypeScript. Prefer discriminated unions. Use `noUncheckedIndexedAccess`. Define interfaces over types
- **Naming**: PascalCase for components/types, camelCase for functions/variables. Node types use pattern `TypeNode` (e.g., `TextNode`)
- **JSX**: Prefer `style` object prop over className. Use `classList` for conditional classes
- **Architecture**: Tool pattern with `build()` factory and `render()` methods. Nodes follow same pattern
- **State**: Use SolidJS `createSignal`/`createStore`, not React hooks
- **Error handling**: Try-catch for pointer capture/release. Allow unhandled errors elsewhere

## Project Structure
- `src/nodes/`: Canvas node types (drawable elements)
- `src/tools/`: Drawing tools (pen, eraser, text, etc.)
- `src/strokes/`: Stroke rendering and simplification

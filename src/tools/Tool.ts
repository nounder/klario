import type { JSX } from "solid-js"
import type { Node } from "../nodes/index.ts"
import type { Point, ToolCanvasProps } from "../types.ts"

// Shared context passed to all event handlers
export type ToolContext = {
  point: Point
  addNode: (node: Node) => void
  deleteNodes: (nodeIds: string[]) => void
  nodes: Node[]
}

// Tool instance returned by build()
export type ToolInstance = {
  onPointerDown?: (ctx: ToolContext) => void
  onPointerMove?: (ctx: ToolContext) => void
  onPointerUp?: (ctx: ToolContext) => void
  onPointerCancel?: () => void
  renderSettings?: () => JSX.Element
  renderCanvas?: (props: ToolCanvasProps) => JSX.Element
}

/**
 * Type-safe build() function for creating tool instances.
 *
 * Event handlers are declared in the factory closure with access to state/setState.
 *
 * @example
 * ```tsx
 * export const build = Tool.build(() => {
 *   const [state, setState] = createStore<State>({
 *     color: "#000000",
 *     width: 6,
 *     currentPath: []
 *   })
 *
 *   return {
 *     onPointerDown: (ctx) => {
 *       setState("currentPath", [ctx.point])
 *     },
 *     onPointerMove: (ctx) => {
 *       setState("currentPath", [...state.currentPath, ctx.point])
 *     },
 *     renderSettings: () => (
 *       <ColorPicker value={state.color} onChange={(c) => setState("color", c)} />
 *     )
 *   }
 * })
 * ```
 */
export function build<T extends any[] = []>(
  factory: (...args: T) => ToolInstance
): (...args: T) => ToolInstance {
  return factory
}

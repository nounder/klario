import * as Strokes from "../strokes/index.ts"
import type { Node, StrokeNode } from "./index.ts"

export const Type = "StrokeNode"

export function render(
  node: StrokeNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: Node) => Node
  },
) {
  const options = {
    width: node.stroke.width,
    color: node.stroke.color,
  }

  // Map stroke type to stroke renderer
  const renderer = Strokes[node.stroke.type]

  return renderer?.render(node.stroke.points, options)
}

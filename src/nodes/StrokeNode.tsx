import * as Strokes from "../strokes/index.ts"
import type { Node as NodeType, StrokeNode } from "../types"

export const Type = "StrokeNode"

export function render(
  node: StrokeNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: NodeType) => NodeType
  },
) {
  const options = {
    width: node.stroke.width,
    color: node.stroke.color,
  }

  // Map stroke type to stroke renderer
  const strokeTypeName = node.stroke.type === "marker"
    ? "MarkerStroke"
    : "PenStroke"
  const renderer = Strokes[strokeTypeName]

  return renderer?.render(node.stroke.points, options)
}

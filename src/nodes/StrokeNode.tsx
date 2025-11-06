import * as Strokes from "../strokes/index.ts"
import type { StrokeNode } from "../types"

export function render(node: StrokeNode) {
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


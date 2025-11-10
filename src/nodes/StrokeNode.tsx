import * as Strokes from "../strokes/index.ts"
import type { Node, StrokeNode } from "./index.ts"
import type { Stroke } from "../types"
import * as Unique from "../Unique.ts"

export const Type = "StrokeNode"

export function make(props: {
  stroke: Omit<Stroke, "bounds">
}): StrokeNode {
  return {
    id: Unique.token(16),
    type: Type,
    parent: null,
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    locked: false,
    stroke: props.stroke,
  }
}

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

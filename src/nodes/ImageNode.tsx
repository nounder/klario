import type { ImageNode, Node as NodeType } from "./index.ts"
import type { Bounds } from "../types"
import * as Unique from "../Unique.ts"

export const Type = "ImageNode"

export function make(props: {
  uri: string
  bounds: Bounds
}): ImageNode {
  return {
    id: Unique.token(16),
    type: Type,
    parent: null,
    bounds: props.bounds,
    locked: false,
    uri: props.uri,
  }
}

export function render(
  node: ImageNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: NodeType) => NodeType
  },
) {
  return (
    <image
      href={node.uri}
      x={node.bounds.x}
      y={node.bounds.y}
      width={node.bounds.width}
      height={node.bounds.height}
    />
  )
}

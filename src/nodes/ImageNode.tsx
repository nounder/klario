import type { ImageNode, Node as NodeType } from "../types"

export const Type = "ImageNode"

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

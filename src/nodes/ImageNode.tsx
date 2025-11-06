import type { ImageNode } from "../types"

export function render(node: ImageNode) {
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

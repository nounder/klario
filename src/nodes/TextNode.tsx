import type { TextNode } from "../types"

export function render(node: TextNode) {
  return (
    <text
      x={node.bounds.x}
      y={node.bounds.y + node.fontSize}
      font-size={`${node.fontSize}px`}
      fill={node.color}
    >
      {node.content}
    </text>
  )
}

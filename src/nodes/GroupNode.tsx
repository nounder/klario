import { For } from "solid-js"
import type { GroupNode, Node as NodeType } from "../types"
import * as Nodes from "./index.ts"

export const Type = "GroupNode"

export function render(
  node: GroupNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: NodeType) => NodeType
  },
) {
  return (
    <g>
      <For each={node.children}>
        {(child) => {
          const renderer = Nodes[child.type]
          return renderer?.render(child as never, ctx)
        }}
      </For>
    </g>
  )
}

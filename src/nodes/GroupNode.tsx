import { For } from "solid-js"
import type { GroupNode, Node as NodeType } from "./index.ts"
import * as Nodes from "./index.ts"
import * as Unique from "../Unique.ts"

export const Type = "GroupNode"

export function make(props?: {
  children?: NodeType[]
}): GroupNode {
  return {
    id: Unique.token(16),
    type: Type,
    parent: null,
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    locked: false,
    children: props?.children ?? [],
  }
}

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

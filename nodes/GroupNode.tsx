import { For } from "solid-js"
import type { GroupNode, Node } from "../types"
import * as Nodes from "./index.ts"

export function render(node: GroupNode) {
  return (
    <g>
      <For each={node.children}>
        {(child) => {
          const renderer = Nodes[child.type]
          return renderer?.render(child as any)
        }}
      </For>
    </g>
  )
}

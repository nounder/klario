import { createStore } from "solid-js/store"
import * as GroupNode from "../nodes/GroupNode.tsx"
import type { Node } from "../nodes/index.ts"
import * as Tool from "./Tool.ts"

export const NodeType = GroupNode.Type

export const make = Tool.build(() => {
  const [state, setState] = createStore({
    selectedNodes: [] as Node[],
  })

  return {
    renderSettings: () => (
      <>
        <div class="flex gap-3 items-center">
          <span class="text-[13px] font-semibold text-black/70">
            Selected: {state.selectedNodes.length} node(s)
          </span>
        </div>

        <button
          onClick={() => {
            // Group selected nodes logic would go here
          }}
          disabled={state.selectedNodes.length < 2}
          class="px-4 py-2 text-white border-2 border-white/30 rounded-[10px] font-semibold text-[13px] tracking-[0.5px]"
          classList={{
            "bg-blue-500/90 cursor-pointer": state.selectedNodes.length >= 2,
            "bg-gray-400/50 cursor-not-allowed":
              state.selectedNodes.length < 2,
          }}
        >
          Group Nodes
        </button>
      </>
    ),
  }
})

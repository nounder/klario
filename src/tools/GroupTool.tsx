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
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <span
            style={{
              "font-size": "13px",
              "font-weight": "600",
              color: "rgba(0, 0, 0, 0.7)",
            }}
          >
            Selected: {state.selectedNodes.length} node(s)
          </span>
        </div>

        <button
          onClick={() => {
            // Group selected nodes logic would go here
          }}
          disabled={state.selectedNodes.length < 2}
          style={{
            padding: "8px 16px",
            background: state.selectedNodes.length >= 2
              ? "rgba(59, 130, 246, 0.9)"
              : "rgba(200, 200, 200, 0.5)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            "border-radius": "10px",
            cursor: state.selectedNodes.length >= 2
              ? "pointer"
              : "not-allowed",
            "font-weight": "600",
            "font-size": "13px",
            "letter-spacing": "0.5px",
          }}
        >
          Group Nodes
        </button>
      </>
    ),
  }
})

import { For } from "solid-js"
import { createStore } from "solid-js/store"
import type { SetStoreFunction } from "solid-js/store"
import type { AppState, TextToolState } from "../types"

import * as TextNode from "../nodes/TextNode"
import type { Node, StrokePoint } from "../types"
import * as Unique from "../Unique"

export const NodeType = TextNode.Type

export const initialState: TextToolState = {
  fontSize: 24,
  color: "#000000",
}

export function onPointerDown(helpers: {
  setAppStore: (updates: any) => void
}) {
  helpers.setAppStore({
    isDrawing: true,
  })
}

export function onPointerUp(helpers: {
  point: StrokePoint
  state: TextToolState
  setAppStore: (updates: any) => void
  addNode?: (node: Node) => void
  getAppState?: () => any
}) {
  // Create a new TextNode with empty content and unique ID
  const nodeId = Unique.token(16)
  const newNode: Node = {
    id: nodeId,
    type: "TextNode",
    parent: null,
    bounds: {
      x: helpers.point.x,
      y: helpers.point.y,
      width: 200,
      height: helpers.state.fontSize * 2,
    },
    locked: false,
    content: "",
    fontSize: helpers.state.fontSize,
    color: helpers.state.color,
  }

  // Set both the new node and activeNodeId in a single update
  // This ensures the node is rendered with activeNodeId already set
  // isEditingText is derived from activeNodeId + node type
  helpers.setAppStore((prevState: any) => ({
    nodes: [...prevState.nodes, newNode],
    activeNodeId: nodeId,
    isDrawing: false,
  }))
}

export function renderSettings(props: {
  setStore: SetStoreFunction<AppState>
  activeNode: Node | null
}) {
  const [state, setState] = createStore<TextToolState>(initialState)

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ]

  return {
    state,
    setState,
    ui: (
      <>
        {/* Color Picker */}
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <For each={colors}>
            {(c) => (
              <button
                onClick={() => setState("color", c)}
                style={{
                  width: "36px",
                  height: "36px",
                  border: state.color === c
                    ? "3px solid rgba(0, 0, 0, 0.6)"
                    : "2px solid rgba(255, 255, 255, 0.3)",
                  background: c,
                  cursor: "pointer",
                  "border-radius": "12px",
                  "box-shadow": state.color === c
                    ? "0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.5)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.2s ease",
                  transform: state.color === c ? "scale(1.1)" : "scale(1)",
                }}
                title={c}
              />
            )}
          </For>
        </div>

        {/* Font Size Slider */}
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <input
            type="range"
            min={12}
            max={72}
            value={state.fontSize}
            onInput={(e) =>
              setState("fontSize", parseInt(e.currentTarget.value))}
            style={{
              width: "140px",
              height: "6px",
              background: "rgba(255, 255, 255, 0.3)",
              "border-radius": "3px",
              outline: "none",
              appearance: "none",
              "-webkit-appearance": "none",
            }}
          />
          <span
            style={{
              "min-width": "40px",
              "font-weight": "600",
              color: "rgba(0, 0, 0, 0.7)",
              "font-size": "13px",
              background: "rgba(255, 255, 255, 0.5)",
              padding: "4px 8px",
              "border-radius": "8px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {state.fontSize}px
          </span>
        </div>
      </>
    ),
    renderNode: () => {
      return null
    },
  }
}

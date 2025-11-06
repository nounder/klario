import { For } from "solid-js"
import { createStore } from "solid-js/store"
import type { SetStoreFunction } from "solid-js/store"
import type { AppState, TextToolState } from "../types"

import type { Node, StrokePoint } from "../types"

export const initialState: TextToolState = {
  content: "",
  fontSize: 24,
  color: "#000000",
}

export function onPointerDown(helpers: {
  point: StrokePoint
  state: TextToolState
  addNode: (node: Node) => void
}) {
  if (helpers.state.content) {
    const newNode: Node = {
      type: "TextNode",
      parent: null,
      bounds: {
        x: helpers.point.x,
        y: helpers.point.y,
        width: helpers.state.content.length * helpers.state.fontSize * 0.6,
        height: helpers.state.fontSize,
      },
      locked: false,
      content: helpers.state.content,
      fontSize: helpers.state.fontSize,
      color: helpers.state.color,
    }
    helpers.addNode(newNode)
  }
}

export function renderSettings(props: {
  setStore: SetStoreFunction<AppState>
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
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <input
            type="text"
            placeholder="Enter text"
            value={state.content}
            onInput={(e) => setState("content", e.currentTarget.value)}
            style={{
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.5)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              "border-radius": "10px",
              "font-size": "13px",
              "min-width": "200px",
            }}
          />
        </div>

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

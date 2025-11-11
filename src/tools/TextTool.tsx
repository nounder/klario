import { For } from "solid-js"
import { createStore } from "solid-js/store"

import CollapsibleSetting from "../CollapsibleSetting.tsx"
import type { Node } from "../nodes/index.ts"
import * as TextNode from "../nodes/TextNode.tsx"
import * as Unique from "../Unique.ts"
import * as Tool from "./Tool.ts"

export const NodeType = TextNode.Type

export const make = Tool.build(() => {
  const [state, setState] = createStore({
    fontSize: 24,
    color: "#000000",
  })

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
    onPointerDown: () => {
      // Set drawing state will be handled by Canvas
    },
    onPointerUp: (ctx) => {
      // Create a new TextNode with empty content and unique ID
      const nodeId = Unique.token(16)
      const newNode: Node = {
        id: nodeId,
        type: "TextNode",
        parent: null,
        bounds: {
          x: ctx.point.x,
          y: ctx.point.y,
          width: 200,
          height: state.fontSize * 2,
        },
        locked: false,
        content: "",
        fontSize: state.fontSize,
        color: state.color,
      }

      ctx.addNode(newNode)
      // Note: activeNodeId setting would need to be handled separately
      // as we don't have setAppStore anymore
    },
    renderSettings: () => (
      <>
        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr 1fr",
            gap: "8px",
            width: "100%",
          }}
        >
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
                  "border-radius": "8px",
                  "box-shadow": state.color === c
                    ? "0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.5)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.2s ease",
                  transform: state.color === c ? "scale(1.05)" : "scale(1)",
                }}
                title={c}
              />
            )}
          </For>
        </div>

        <CollapsibleSetting icon="🔤" title="Font Size">
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "8px",
              width: "100%",
              "align-items": "center",
            }}
          >
            <input
              type="range"
              min={12}
              max={72}
              value={state.fontSize}
              onInput={(e) =>
                setState("fontSize", parseInt(e.currentTarget.value))}
              style={{
                width: "100%",
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
                "font-weight": "600",
                color: "rgba(0, 0, 0, 0.7)",
                "font-size": "11px",
                background: "rgba(255, 255, 255, 0.5)",
                padding: "2px 6px",
                "border-radius": "6px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {state.fontSize}px
            </span>
          </div>
        </CollapsibleSetting>
      </>
    ),
  }
})

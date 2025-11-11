import { createStore } from "solid-js/store"

import * as ImageNode from "../nodes/ImageNode.tsx"
import type { Node } from "../nodes/index.ts"
import * as Unique from "../Unique.ts"
import * as Tool from "./Tool.ts"

export const NodeType = ImageNode.Type

export const make = Tool.build(() => {
  const [state, setState] = createStore({
    uri: "",
    width: 200,
    height: 200,
  })

  return {
    onPointerDown: (ctx) => {
      if (state.uri) {
        const newNode: Node = {
          id: Unique.token(16),
          type: "ImageNode",
          parent: null,
          bounds: {
            x: ctx.point.x,
            y: ctx.point.y,
            width: state.width,
            height: state.height,
          },
          locked: false,
          uri: state.uri,
        }
        ctx.addNode(newNode)
      }
    },
    renderSettings: () => (
      <>
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <input
            type="text"
            placeholder="Image URL"
            value={state.uri}
            onInput={(e) => setState("uri", e.currentTarget.value)}
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

        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ "font-size": "13px", "font-weight": "600" }}>
            Width:
            <input
              type="range"
              min={50}
              max={500}
              value={state.width}
              onInput={(e) =>
                setState("width", parseInt(e.currentTarget.value))}
              style={{
                width: "100px",
                "margin-left": "8px",
              }}
            />
            {state.width}px
          </label>
        </div>

        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ "font-size": "13px", "font-weight": "600" }}>
            Height:
            <input
              type="range"
              min={50}
              max={500}
              value={state.height}
              onInput={(e) =>
                setState("height", parseInt(e.currentTarget.value))}
              style={{
                width: "100px",
                "margin-left": "8px",
              }}
            />
            {state.height}px
          </label>
        </div>
      </>
    ),
  }
})

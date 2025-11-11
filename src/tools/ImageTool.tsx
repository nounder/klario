import { createStore } from "solid-js/store"

import CollapsibleSetting from "../CollapsibleSetting.tsx"
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
        <CollapsibleSetting icon="🔗" title="Image URL">
          <input
            type="text"
            placeholder="Image URL"
            value={state.uri}
            onInput={(e) => setState("uri", e.currentTarget.value)}
            style={{
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.5)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              "border-radius": "8px",
              "font-size": "11px",
              width: "100%",
              "box-sizing": "border-box",
            }}
          />
        </CollapsibleSetting>

        <CollapsibleSetting icon="↔️" title="Width">
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
              min={50}
              max={500}
              value={state.width}
              onInput={(e) =>
                setState("width", parseInt(e.currentTarget.value))}
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
              {state.width}px
            </span>
          </div>
        </CollapsibleSetting>

        <CollapsibleSetting icon="↕️" title="Height">
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
              min={50}
              max={500}
              value={state.height}
              onInput={(e) =>
                setState("height", parseInt(e.currentTarget.value))}
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
              {state.height}px
            </span>
          </div>
        </CollapsibleSetting>
      </>
    ),
  }
})

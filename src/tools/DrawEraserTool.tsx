import { createStore } from "solid-js/store"

import CollapsibleSetting from "../CollapsibleSetting.tsx"
import * as DrawEraserNode from "../nodes/DrawEraserNode.tsx"
import type { Node } from "../nodes/index.ts"
import { simplifyStroke } from "../simplification.ts"
import type { StrokePoint } from "../types.ts"
import * as Unique from "../Unique.ts"
import { calculateBoundsFromPoints } from "../utils.ts"
import * as Tool from "./Tool.ts"

export const NodeType = DrawEraserNode.Type

export const make = Tool.build(() => {
  const [state, setState] = createStore({
    width: 20,
    currentPath: [] as StrokePoint[],
  })

  return {
    onPointerDown: (ctx) => {
      setState("currentPath", [ctx.point])
    },
    onPointerMove: (ctx) => {
      setState("currentPath", [...state.currentPath, ctx.point])
    },
    onPointerUp: (ctx) => {
      if (state.currentPath.length > 0) {
        // Apply Douglas-Peucker simplification (same as marker strokes)
        const epsilon = 0.5 * Math.max(1, state.width / 10)
        const simplifiedPoints = simplifyStroke(state.currentPath, epsilon)
        const bounds = calculateBoundsFromPoints(simplifiedPoints, state.width)

        const newNode: Node = {
          id: Unique.token(16),
          type: "DrawEraserNode",
          parent: null,
          bounds,
          locked: false,
          points: simplifiedPoints,
          width: state.width,
        }

        ctx.addNode(newNode)
        setState("currentPath", [])
      }
    },
    onPointerCancel: () => {
      setState("currentPath", [])
    },
    renderSettings: () => (
      <>
        <CollapsibleSetting icon="📏" title="Eraser Size">
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
              min={5}
              max={50}
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
      </>
    ),
    renderCanvas: (_props) => {
      return (
        <g style={{ "will-change": "transform" }}>
          {/* Render temporary eraser stroke preview while drawing */}
          {state.currentPath.length > 0 && (() => {
            const node = {
              id: "temp",
              type: "DrawEraserNode" as const,
              parent: null,
              bounds: { x: 0, y: 0, width: 0, height: 0 },
              locked: false,
              points: state.currentPath,
              width: state.width,
            }

            return DrawEraserNode.render(node)
          })()}
        </g>
      )
    },
  }
})

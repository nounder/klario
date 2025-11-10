import { For } from "solid-js"
import { createStore } from "solid-js/store"

import type { Node } from "../nodes/index.ts"
import * as StrokeNode from "../nodes/StrokeNode.tsx"
import { simplifyStroke } from "../simplification.ts"
import type { StrokeType } from "../strokes/index.ts"
import type { StrokePoint } from "../types.ts"
import * as Unique from "../Unique.ts"
import { calculateBoundsFromPoints } from "../utils.ts"
import * as Tool from "./Tool.ts"

export const NodeType = StrokeNode.Type

export const StrokeTool = Tool.build(() => {
  const [state, setState] = createStore({
    strokeType: "MarkerStroke" as StrokeType,
    color: "#000000",
    width: 6,
    currentPath: [] as StrokePoint[],
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

  const brushTypes: Array<
    { type: StrokeType; label: string }
  > = [
    { type: "PenStroke", label: "Pen" },
    { type: "MarkerStroke", label: "Marker" },
  ]

  return {
    onPointerDown: (ctx) => {
      setState("currentPath", [ctx.point])
    },
    onPointerMove: (ctx) => {
      setState("currentPath", [...state.currentPath, ctx.point])
    },
    onPointerUp: (ctx) => {
      if (state.currentPath.length > 0) {
        // Apply Douglas-Peucker simplification
        const epsilonMultiplier = state.strokeType === "PenStroke" ? 0.3 : 0.5
        const epsilon = epsilonMultiplier * Math.max(1, state.width / 10)
        const simplifiedPoints = simplifyStroke(state.currentPath, epsilon)
        const bounds = calculateBoundsFromPoints(simplifiedPoints, state.width)

        const newNode: Node = {
          id: Unique.token(16),
          type: "StrokeNode",
          parent: null,
          bounds,
          locked: false,
          stroke: {
            type: state.strokeType,
            points: simplifiedPoints,
            color: state.color,
            width: state.width,
          },
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

        {/* Brush Type Selector */}
        <div style={{ display: "flex", gap: "8px" }}>
          <For each={brushTypes}>
            {(brush) => (
              <button
                onClick={() => setState("strokeType", brush.type)}
                style={{
                  padding: "8px 16px",
                  background: state.strokeType === brush.type
                    ? "rgba(59, 130, 246, 0.9)"
                    : "rgba(255, 255, 255, 0.5)",
                  color: state.strokeType === brush.type
                    ? "white"
                    : "rgba(0, 0, 0, 0.7)",
                  border: state.strokeType === brush.type
                    ? "2px solid rgba(59, 130, 246, 1)"
                    : "2px solid rgba(255, 255, 255, 0.3)",
                  "border-radius": "10px",
                  cursor: "pointer",
                  "font-weight": "600",
                  "font-size": "13px",
                  "letter-spacing": "0.5px",
                  "box-shadow": state.strokeType === brush.type
                    ? "0 4px 16px rgba(59, 130, 246, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.2s ease",
                  transform: state.strokeType === brush.type
                    ? "scale(1.05)"
                    : "scale(1)",
                }}
                title={brush.label}
              >
                {brush.label}
              </button>
            )}
          </For>
        </div>

        {/* Width Slider */}
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <input
            type="range"
            min={1}
            max={20}
            value={state.width}
            onInput={(e) => setState("width", parseInt(e.currentTarget.value))}
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
            {state.width}px
          </span>
        </div>
      </>
    ),
    renderCanvas: (_props) => {
      return (
        <g style={{ "will-change": "transform" }}>
          {/* Render temporary stroke preview while drawing */}
          {state.currentPath.length > 0 && (() => {
            const node = {
              id: "temp",
              type: "StrokeNode" as const,
              parent: null,
              bounds: { x: 0, y: 0, width: 0, height: 0 },
              locked: false,
              stroke: {
                type: state.strokeType,
                points: state.currentPath,
                width: state.width,
                color: state.color,
              },
            }

            return StrokeNode.render(node)
          })()}
        </g>
      )
    },
  }
})

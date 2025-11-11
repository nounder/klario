import { For } from "solid-js"
import { createStore } from "solid-js/store"
import type { Node } from "../nodes/index.ts"
import * as MarkerStrokeNode from "../nodes/MarkerStrokeNode.tsx"
import { simplifyStroke } from "../simplification.ts"
import type { StrokePoint } from "../types.ts"
import * as Unique from "../Unique.ts"
import { calculateBoundsFromPoints } from "../utils.ts"
import * as Tool from "./Tool.ts"

const DefaultColors = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
]

export const NodeType = MarkerStrokeNode.Type

export const make = Tool.build((options?: {
  colors?: typeof DefaultColors
  epsilon?: number
}) => {
  const [state, setState] = createStore({
    color: "#000000",
    width: 8,
    currentPath: [] as StrokePoint[],
  })

  const colors = options?.colors ?? DefaultColors
  const epsilon = options?.epsilon ?? 0.5

  return {
    onPointerDown: (ctx) => {
      setState("currentPath", [ctx.point])
    },
    onPointerMove: (ctx) => {
      setState("currentPath", [...state.currentPath, ctx.point])
    },
    onPointerUp: (ctx) => {
      if (state.currentPath.length > 0) {
        const epsilonValue = epsilon * Math.max(1, state.width / 10)
        const simplifiedPoints = epsilon > 0
          ? simplifyStroke(state.currentPath, epsilonValue)
          : state.currentPath
        if (epsilon > 0) {
          console.debug(
            `Simplification: ${state.currentPath.length} → ${simplifiedPoints.length} points (epsilon: ${epsilonValue.toFixed(2)})`,
          )
        }
        const bounds = calculateBoundsFromPoints(
          simplifiedPoints,
          state.width,
        )

        const newNode: Node = {
          id: Unique.token(16),
          type: "MarkerStrokeNode",
          parent: null,
          bounds,
          locked: false,
          stroke: {
            type: "MarkerStroke",
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
        <div
          style={{ display: "flex", gap: "12px", "align-items": "center" }}
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

        <div
          style={{ display: "flex", gap: "12px", "align-items": "center" }}
        >
          <input
            type="range"
            min={3}
            max={25}
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
          {state.currentPath.length > 0 && (() => {
            const node = {
              id: "temp",
              type: "MarkerStrokeNode" as const,
              parent: null,
              bounds: { x: 0, y: 0, width: 0, height: 0 },
              locked: false,
              stroke: {
                type: "MarkerStroke" as const,
                points: state.currentPath,
                width: state.width,
                color: state.color,
              },
            }

            return MarkerStrokeNode.render(node)
          })()}
        </g>
      )
    },
  }
})

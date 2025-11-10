import { createStore } from "solid-js/store"
import type { SetStoreFunction } from "solid-js/store"
import type { AppState, ToolCanvasProps } from "../types"

import * as DrawEraserNode from "../nodes/DrawEraserNode"
import type { StrokePoint } from "../types"
import type { Node } from "../nodes/index.ts"
import * as Unique from "../Unique"

export interface State {
  width: number
  currentPath: StrokePoint[]
}

export interface DrawEraserTool {
  type: "DrawEraserTool"
  state: State
}

export const NodeType = DrawEraserNode.Type

export const initialState: State = {
  width: 20,
  currentPath: [],
}

export function onPointerEnter(helpers: {
  setAppStore: (updates: any) => void
}) {
  helpers.setAppStore({ rootStyle: { cursor: "none" } })
}

export function onPointerLeave(helpers: {
  setAppStore: (updates: any) => void
}) {
  helpers.setAppStore({ rootStyle: {} })
}

export function onPointerDown(helpers: {
  point: StrokePoint
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
}) {
  helpers.setState("currentPath", [helpers.point])
  helpers.setAppStore({
    isDrawing: true,
  })
}

export function onPointerMove(helpers: {
  point: StrokePoint
  state: State
  setState: (key: string, value: any) => void
}) {
  helpers.setState("currentPath", (prev: StrokePoint[]) => [
    ...prev,
    helpers.point,
  ])
}

export function onPointerUp(helpers: {
  state: State
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
  calculateBounds: (points: StrokePoint[], width?: number) => any
  simplifyStroke: (points: StrokePoint[], epsilon: number) => StrokePoint[]
  addNode: (node: Node) => void
}) {
  const { state } = helpers

  if (state.currentPath.length > 0) {
    // Apply Douglas-Peucker simplification (same as marker strokes)
    const epsilon = 0.5 * Math.max(1, state.width / 10)
    const simplifiedPoints = helpers.simplifyStroke(state.currentPath, epsilon)
    const bounds = helpers.calculateBounds(simplifiedPoints, state.width)

    const newNode: Node = {
      id: Unique.token(16),
      type: "DrawEraserNode",
      parent: null,
      bounds,
      locked: false,
      points: simplifiedPoints,
      width: state.width,
    }

    helpers.addNode(newNode)
    helpers.setState("currentPath", [])
  }

  helpers.setAppStore({ isDrawing: false })
}

export function onPointerCancel(helpers: {
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
}) {
  helpers.setState("currentPath", [])
  helpers.setAppStore({ isDrawing: false })
}

export function renderSettings(props: {
  setStore: SetStoreFunction<AppState>
  activeNode: Node | null
}) {
  const [state, setState] = createStore<State>(initialState)

  return {
    state,
    setState,
    ui: (
      <>
        {/* Width Slider */}
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <span
            style={{
              "font-weight": "600",
              color: "rgba(0, 0, 0, 0.7)",
              "font-size": "13px",
            }}
          >
            Eraser Size:
          </span>
          <input
            type="range"
            min={5}
            max={50}
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
    renderCanvas: (props: ToolCanvasProps) => {
      return (
        <g style={{ "will-change": "transform", cursor: "none" }}>
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

          {/* Render cursor circle */}
          {props.pointerPosition && (
            <circle
              cx={props.pointerPosition.x}
              cy={props.pointerPosition.y}
              r={state.width / 2}
              fill="none"
              stroke="rgba(0, 0, 0, 0.3)"
              stroke-width={2}
              pointer-events="none"
            />
          )}
        </g>
      )
    },
  }
}

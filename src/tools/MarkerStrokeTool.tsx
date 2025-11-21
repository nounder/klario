import { For } from "solid-js"
import { createStore } from "solid-js/store"
import CollapsibleSetting from "../CollapsibleSetting.tsx"
import ColorPicker from "../ColorPicker.tsx"
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

function WidthPicker(props: {
  value: number
  onChange: (width: number) => void
  sizes?: number[]
}) {
  const sizes = props.sizes ?? [14, 18, 28, 42]

  // Find nearest value if exact match doesn't exist - wrapped in function for reactivity
  const normalizedValue = () =>
    sizes.includes(props.value)
      ? props.value
      : sizes.reduce((prev, curr) =>
        Math.abs(curr - props.value) < Math.abs(prev - props.value)
          ? curr
          : prev
      )

  return (
    <div class="flex flex-col gap-1 items-center py-2">
      <For each={[...sizes].reverse()}>
        {(size) => (
          <button
            onClick={() => props.onChange(size)}
            class="bg-transparent border-none cursor-pointer transition-all duration-200 flex items-center justify-center"
            style={{
              width: `${Math.max(size + 10, 24)}px`,
              height: `${Math.max(size + 10, 24)}px`,
            }}
          >
            <div
              class="rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background:
                  "radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 100%)",
                "backdrop-filter": "blur(22px)",
                ...(normalizedValue() === size
                  ? {
                    border: "2px solid white",
                    outline: "3px solid #000",
                    "outline-offset": "0px",
                  }
                  : {}),
              }}
            />
          </button>
        )}
      </For>
    </div>
  )
}

export const make = Tool.build((options?: {
  colors?: typeof DefaultColors
  epsilon?: number
  onColorPicked?: () => void
  width?: () => number
  onWidthChange?: (width: number) => void
}) => {
  const [state, setState] = createStore({
    color: "#FFFF00",
    width: 14,
    opacity: 1,
    currentPath: [] as StrokePoint[],
  })

  const colors = options?.colors ?? DefaultColors
  const epsilon = options?.epsilon ?? 0.5

  // Use shared width if provided, otherwise use local state
  const width = () => options?.width ? options.width() : state.width
  const setWidth = (w: number) => {
    if (options?.onWidthChange) {
      options.onWidthChange(w)
    } else {
      setState("width", w)
    }
  }

  return {
    onPointerDown: (ctx) => {
      setState("currentPath", [ctx.point])
    },
    onPointerMove: (ctx) => {
      setState("currentPath", [...state.currentPath, ctx.point])
    },
    onPointerUp: (ctx) => {
      if (state.currentPath.length > 0) {
        const currentWidth = width()
        const epsilonValue = epsilon * Math.max(1, currentWidth / 10)
        const simplifiedPoints = epsilon > 0
          ? simplifyStroke(state.currentPath, epsilonValue)
          : state.currentPath
        if (epsilon > 0) {
          console.debug(
            `Simplification: ${state.currentPath.length} → ${simplifiedPoints.length} points (epsilon: ${
              epsilonValue.toFixed(2)
            })`,
          )
        }
        const bounds = calculateBoundsFromPoints(
          simplifiedPoints,
          currentWidth,
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
            width: currentWidth,
            opacity: state.opacity,
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
        <ColorPicker
          colors={colors}
          value={state.color}
          onChange={(c) => setState("color", c)}
          onColorPicked={options?.onColorPicked}
        />

        <WidthPicker
          value={width()}
          onChange={setWidth}
        />
      </>
    ),
    renderCanvas: (_props) => {
      return (
        <g class="will-change-transform">
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
                width: width(),
                color: state.color,
                opacity: state.opacity,
              },
            }

            return MarkerStrokeNode.render(node)
          })()}
        </g>
      )
    },
  }
})

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

export const make = Tool.build((options?: {
  colors?: typeof DefaultColors
  epsilon?: number
  onColorPicked?: () => void
}) => {
  const [state, setState] = createStore({
    color: "#000000",
    width: 8,
    opacity: 1,
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

        <CollapsibleSetting icon="✏️" title="Width Settings">
          <div class="flex flex-col gap-2 w-full items-center">
            <input
              type="range"
              min={3}
              max={25}
              value={state.width}
              onInput={(e) =>
                setState("width", parseInt(e.currentTarget.value))}
              class="w-full h-1.5 bg-white/30 rounded outline-none appearance-none"
            />
            <span class="font-semibold text-black/70 text-[11px] bg-white/50 px-1.5 py-0.5 rounded-md border border-white/30">
              {state.width}px
            </span>
          </div>
        </CollapsibleSetting>

        <CollapsibleSetting icon="💧" title="Opacity Settings">
          <div class="flex flex-col gap-2 w-full items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={state.opacity * 100}
              onInput={(e) =>
                setState("opacity", parseInt(e.currentTarget.value) / 100)}
              class="w-full h-1.5 bg-white/30 rounded outline-none appearance-none"
            />
            <span class="font-semibold text-black/70 text-[11px] bg-white/50 px-1.5 py-0.5 rounded-md border border-white/30">
              {Math.round(state.opacity * 100)}%
            </span>
          </div>
        </CollapsibleSetting>
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
                width: state.width,
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

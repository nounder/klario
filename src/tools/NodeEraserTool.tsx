import { createStore } from "solid-js/store"
import CollapsibleSetting from "../CollapsibleSetting.tsx"
import type { Node } from "../nodes/index.ts"
import type { Bounds, StrokePoint } from "../types.ts"
import * as Tool from "./Tool.ts"

export const NodeType = null // Eraser doesn't create nodes

// Helper function to check if a point is within a certain distance of a line segment
function pointToSegmentDistance(
  p: StrokePoint,
  a: StrokePoint,
  b: StrokePoint,
): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    const distX = p.x - a.x
    const distY = p.y - a.y
    return Math.sqrt(distX * distX + distY * distY)
  }

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const closestX = a.x + t * dx
  const closestY = a.y + t * dy

  const distX = p.x - closestX
  const distY = p.y - closestY

  return Math.sqrt(distX * distX + distY * distY)
}

// Check if eraser path intersects with a node
function checkIntersection(
  eraserPath: StrokePoint[],
  eraserWidth: number,
  node: Node,
): boolean {
  if (eraserPath.length === 0) return false

  const eraserRadius = eraserWidth / 2

  if (node.type === "StrokeNode") {
    const strokePoints = node.stroke.points
    const strokeWidth = node.stroke.width
    const strokeRadius = strokeWidth / 2
    const threshold = eraserRadius + strokeRadius

    for (let i = 0; i < eraserPath.length; i++) {
      const eraserPoint = eraserPath[i]
      if (!eraserPoint) continue

      for (let j = 0; j < strokePoints.length; j++) {
        const strokePoint = strokePoints[j]
        if (!strokePoint) continue

        const dx = strokePoint.x - eraserPoint.x
        const dy = strokePoint.y - eraserPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= threshold) {
          return true
        }

        if (j > 0) {
          const prevStrokePoint = strokePoints[j - 1]
          if (!prevStrokePoint) continue

          const dist = pointToSegmentDistance(
            eraserPoint,
            prevStrokePoint,
            strokePoint,
          )

          if (dist <= threshold) {
            return true
          }
        }
      }
    }

    if (eraserPath.length > 1) {
      for (let i = 1; i < eraserPath.length; i++) {
        const eraserPoint = eraserPath[i]
        const prevEraserPoint = eraserPath[i - 1]
        if (!eraserPoint || !prevEraserPoint) continue

        for (const strokePoint of strokePoints) {
          if (!strokePoint) continue

          const dist = pointToSegmentDistance(
            strokePoint,
            prevEraserPoint,
            eraserPoint,
          )

          if (dist <= threshold) {
            return true
          }
        }
      }
    }

    return false
  }

  for (let i = 0; i < eraserPath.length; i++) {
    const point = eraserPath[i]
    if (!point) continue

    if (
      point.x + eraserRadius >= node.bounds.x
      && point.x - eraserRadius <= node.bounds.x + node.bounds.width
      && point.y + eraserRadius >= node.bounds.y
      && point.y - eraserRadius <= node.bounds.y + node.bounds.height
    ) {
      return true
    }

    if (i > 0) {
      const prevPoint = eraserPath[i - 1]
      if (!prevPoint) continue

      if (
        segmentIntersectsRect(
          prevPoint,
          point,
          {
            x: node.bounds.x,
            y: node.bounds.y,
            width: node.bounds.width,
            height: node.bounds.height,
          },
        )
      ) {
        return true
      }
    }
  }

  return false
}

function segmentIntersectsRect(
  p1: StrokePoint,
  p2: StrokePoint,
  rect: Bounds,
): boolean {
  if (
    (p1.x >= rect.x
      && p1.x <= rect.x + rect.width
      && p1.y >= rect.y
      && p1.y <= rect.y + rect.height)
    || (p2.x >= rect.x
      && p2.x <= rect.x + rect.width
      && p2.y >= rect.y
      && p2.y <= rect.y + rect.height)
  ) {
    return true
  }

  const left = rect.x
  const right = rect.x + rect.width
  const top = rect.y
  const bottom = rect.y + rect.height

  return (
    lineSegmentsIntersect(p1, p2, { x: left, y: top }, { x: left, y: bottom })
    || lineSegmentsIntersect(p1, p2, { x: right, y: top }, {
      x: right,
      y: bottom,
    })
    || lineSegmentsIntersect(p1, p2, { x: left, y: top }, { x: right, y: top })
    || lineSegmentsIntersect(p1, p2, { x: left, y: bottom }, {
      x: right,
      y: bottom,
    })
  )
}

function lineSegmentsIntersect(
  p1: StrokePoint,
  p2: StrokePoint,
  p3: StrokePoint,
  p4: StrokePoint,
): boolean {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y)

  if (det === 0) return false

  const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y))
    / det

  const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y))
    / det

  return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1
}

export const make = Tool.build(() => {
  const [state, setState] = createStore({
    width: 20,
    currentPath: [] as StrokePoint[],
    intersectedNodeIds: new Set<string>(),
  })

  return {
    onPointerDown: (ctx) => {
      const initialPath = [ctx.point]
      setState("currentPath", initialPath)

      const intersectedIds = new Set<string>()
      for (const node of ctx.nodes) {
        if (!node.locked) {
          if (checkIntersection(initialPath, state.width, node)) {
            intersectedIds.add(node.id)
          }
        }
      }

      setState("intersectedNodeIds", intersectedIds)
    },
    onPointerMove: (ctx) => {
      const newPath = [...state.currentPath, ctx.point]
      setState("currentPath", newPath)

      const intersectedIds = new Set(state.intersectedNodeIds)

      for (const node of ctx.nodes) {
        if (!node.locked && !intersectedIds.has(node.id)) {
          if (checkIntersection(newPath, state.width, node)) {
            intersectedIds.add(node.id)
          }
        }
      }

      setState("intersectedNodeIds", intersectedIds)
    },
    onPointerUp: (ctx) => {
      if (state.intersectedNodeIds.size > 0) {
        ctx.deleteNodes(Array.from(state.intersectedNodeIds))
      }

      setState("currentPath", [])
      setState("intersectedNodeIds", new Set())
    },
    onPointerCancel: () => {
      setState("currentPath", [])
      setState("intersectedNodeIds", new Set())
    },
    renderSettings: () => (
      <>
        <CollapsibleSetting icon="📏" title="Eraser Size">
          <div class="flex flex-col gap-2 w-full items-center">
            <input
              type="range"
              min={5}
              max={50}
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
      </>
    ),
    renderCanvas: (_props) => {
      return (
        <g class="will-change-transform">
          {/* Render temporary eraser path preview while drawing */}
          {state.currentPath.length > 0 && (() => {
            const points = state.currentPath

            const pathData = points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ")

            return (
              <path
                d={pathData}
                stroke="rgba(255, 0, 0, 0.3)"
                stroke-width={state.width}
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
                opacity={0.5}
              />
            )
          })()}
        </g>
      )
    },
  }
})

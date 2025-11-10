import { createStore } from "solid-js/store"
import type { SetStoreFunction } from "solid-js/store"
import type {
  AppState,
  Bounds,
  StrokePoint,
  ToolCanvasProps,
} from "../types"
import type { Node } from "../nodes/index.ts"

export interface State {
  width: number
  currentPath: StrokePoint[]
  intersectedNodeIds: Set<string>
}

export interface NodeEraserTool {
  type: "NodeEraserTool"
  state: State
}

export const NodeType = null // Eraser doesn't create nodes

export const initialState: State = {
  width: 20,
  currentPath: [],
  intersectedNodeIds: new Set(),
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
    // a and b are the same point
    const distX = p.x - a.x
    const distY = p.y - a.y
    return Math.sqrt(distX * distX + distY * distY)
  }

  // Calculate projection parameter
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  // Find the closest point on the segment
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

  // For stroke nodes, check if eraser path intersects with stroke points
  if (node.type === "StrokeNode") {
    const strokePoints = node.stroke.points
    const strokeWidth = node.stroke.width
    const strokeRadius = strokeWidth / 2
    const threshold = eraserRadius + strokeRadius

    // Check each point in the eraser path against stroke points/segments
    for (let i = 0; i < eraserPath.length; i++) {
      const eraserPoint = eraserPath[i]
      if (!eraserPoint) continue

      // Check against each stroke point
      for (let j = 0; j < strokePoints.length; j++) {
        const strokePoint = strokePoints[j]
        if (!strokePoint) continue

        const dx = strokePoint.x - eraserPoint.x
        const dy = strokePoint.y - eraserPoint.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= threshold) {
          return true
        }

        // Check if eraser point is close to stroke segment
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

    // Also check if any stroke point is close to eraser segments
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

  // For other node types (Image, Text, Group), check if eraser path intersects with bounds
  for (let i = 0; i < eraserPath.length; i++) {
    const point = eraserPath[i]
    if (!point) continue

    // Check if eraser circle overlaps with node bounds
    if (
      point.x + eraserRadius >= node.bounds.x
      && point.x - eraserRadius <= node.bounds.x + node.bounds.width
      && point.y + eraserRadius >= node.bounds.y
      && point.y - eraserRadius <= node.bounds.y + node.bounds.height
    ) {
      return true
    }

    // Check if eraser segment intersects bounds edges
    if (i > 0) {
      const prevPoint = eraserPath[i - 1]
      if (!prevPoint) continue

      // Check intersection with all four edges of the bounding box
      const left = node.bounds.x
      const right = node.bounds.x + node.bounds.width
      const top = node.bounds.y
      const bottom = node.bounds.y + node.bounds.height

      // Helper to check if segment intersects with a rectangle
      if (
        segmentIntersectsRect(
          prevPoint,
          point,
          {
            x: left,
            y: top,
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

// Check if a line segment intersects with a rectangle
function segmentIntersectsRect(
  p1: StrokePoint,
  p2: StrokePoint,
  rect: Bounds,
): boolean {
  // Check if either endpoint is inside the rectangle
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

  // Check intersection with each edge
  const left = rect.x
  const right = rect.x + rect.width
  const top = rect.y
  const bottom = rect.y + rect.height

  // Check intersection with left, right, top, bottom edges
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

/**
 * Check if two line segments intersect using parametric line intersection.
 *
 * This function determines whether two line segments (p1-p2 and p3-p4) intersect
 * by solving the parametric equations of both lines and checking if the intersection
 * point lies within both segments.
 *
 * Mathematical Background:
 * - Line segment 1: P(λ) = p1 + λ(p2 - p1), where λ ∈ [0, 1]
 * - Line segment 2: Q(γ) = p3 + γ(p4 - p3), where γ ∈ [0, 1]
 * - Segments intersect if there exist λ, γ ∈ [0, 1] such that P(λ) = Q(γ)
 *
 * Algorithm Steps:
 * 1. Calculate the determinant (det) of the direction vectors
 *    - det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y)
 *    - If det = 0, the lines are parallel or collinear (no unique intersection)
 *
 * 2. Solve for λ (parameter for segment 1):
 *    - λ represents where along segment 1 the intersection occurs
 *    - λ = 0 means intersection at p1, λ = 1 means intersection at p2
 *    - λ ∈ (0, 1) means intersection is strictly between p1 and p2
 *
 * 3. Solve for γ (parameter for segment 2):
 *    - γ represents where along segment 2 the intersection occurs
 *    - γ = 0 means intersection at p3, γ = 1 means intersection at p4
 *    - γ ∈ (0, 1) means intersection is strictly between p3 and p4
 *
 * 4. Intersection exists if both λ ∈ [0, 1] AND γ ∈ [0, 1]
 *
 * @param p1 - First endpoint of segment 1
 * @param p2 - Second endpoint of segment 1
 * @param p3 - First endpoint of segment 2
 * @param p4 - Second endpoint of segment 2
 * @returns true if the segments intersect, false otherwise
 *
 * @example
 * // Segments that intersect in the middle
 * lineSegmentsIntersect(
 *   {x: 0, y: 0}, {x: 10, y: 10},  // Diagonal from bottom-left to top-right
 *   {x: 0, y: 10}, {x: 10, y: 0}   // Diagonal from top-left to bottom-right
 * ) // returns true (they cross at (5, 5))
 *
 * @example
 * // Parallel segments (no intersection)
 * lineSegmentsIntersect(
 *   {x: 0, y: 0}, {x: 10, y: 0},   // Horizontal line at y=0
 *   {x: 0, y: 5}, {x: 10, y: 5}    // Horizontal line at y=5
 * ) // returns false (parallel, det = 0)
 *
 * @example
 * // Segments that would intersect if extended, but don't actually intersect
 * lineSegmentsIntersect(
 *   {x: 0, y: 0}, {x: 5, y: 5},    // Short diagonal
 *   {x: 10, y: 0}, {x: 15, y: 5}   // Another short diagonal, offset
 * ) // returns false (intersection point is outside both segments)
 */
function lineSegmentsIntersect(
  p1: StrokePoint,
  p2: StrokePoint,
  p3: StrokePoint,
  p4: StrokePoint,
): boolean {
  // Calculate the determinant of the direction vectors
  // This represents the cross product of (p2-p1) and (p4-p3)
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y)

  if (det === 0) return false // Parallel or collinear lines (no unique intersection)

  // Calculate λ: the parameter for segment 1 (p1-p2)
  // λ = 0 → intersection at p1
  // λ = 1 → intersection at p2
  // λ ∈ (0,1) → intersection between p1 and p2
  const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y))
    / det

  // Calculate γ: the parameter for segment 2 (p3-p4)
  // γ = 0 → intersection at p3
  // γ = 1 → intersection at p4
  // γ ∈ (0,1) → intersection between p3 and p4
  const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y))
    / det

  // Segments intersect if the intersection point lies on both segments
  // i.e., both parameters are in the range [0, 1]
  return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1
}

export function onPointerDown(helpers: {
  point: StrokePoint
  state: State
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
  nodes?: Node[]
}) {
  const initialPath = [helpers.point]
  helpers.setState("currentPath", initialPath)

  // Check for intersections on pointer down to show preview
  const intersectedIds = new Set<string>()
  if (helpers.nodes) {
    for (const node of helpers.nodes) {
      if (!node.locked) {
        if (checkIntersection(initialPath, helpers.state.width, node)) {
          intersectedIds.add(node.id)
        }
      }
    }
  }

  helpers.setState("intersectedNodeIds", intersectedIds)
  helpers.setAppStore({
    isDrawing: true,
  })
}

export function onPointerMove(helpers: {
  point: StrokePoint
  state: State
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
  nodes?: Node[]
}) {
  const newPath = [...helpers.state.currentPath, helpers.point]
  helpers.setState("currentPath", newPath)

  // Check for intersections with existing nodes
  if (helpers.nodes) {
    const intersectedIds = new Set(helpers.state.intersectedNodeIds)

    for (const node of helpers.nodes) {
      if (!node.locked && !intersectedIds.has(node.id)) {
        if (checkIntersection(newPath, helpers.state.width, node)) {
          intersectedIds.add(node.id)
        }
      }
    }

    helpers.setState("intersectedNodeIds", intersectedIds)
  }
}

export function onPointerUp(helpers: {
  state: State
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
  deleteNodes?: (nodeIds: string[]) => void
}) {
  // Delete all intersected nodes
  if (helpers.deleteNodes && helpers.state.intersectedNodeIds.size > 0) {
    helpers.deleteNodes(Array.from(helpers.state.intersectedNodeIds))
  }

  helpers.setState("currentPath", [])
  helpers.setState("intersectedNodeIds", new Set())
  helpers.setAppStore({ isDrawing: false })
}

export function onPointerCancel(helpers: {
  setState: (key: string, value: any) => void
  setAppStore: (updates: any) => void
}) {
  helpers.setState("currentPath", [])
  helpers.setState("intersectedNodeIds", new Set())
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
          {/* Render temporary eraser path preview while drawing */}
          {state.currentPath.length > 0 && (() => {
            const points = state.currentPath

            // Create a path string for the eraser
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

          {/* Render cursor circle */}
          {props.pointerPosition && (
            <circle
              cx={props.pointerPosition.x}
              cy={props.pointerPosition.y}
              r={state.width / 2}
              fill="none"
              stroke="rgba(255, 0, 0, 0.5)"
              stroke-width={2}
              pointer-events="none"
            />
          )}
        </g>
      )
    },
  }
}

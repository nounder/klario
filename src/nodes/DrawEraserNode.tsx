import type { DrawEraserNode, Node } from "./index.ts"
import type { StrokePoint } from "../types"

export const Type = "DrawEraserNode"

function createSmoothPath(points: StrokePoint[]): string {
  if (points.length === 0) return ""
  if (points.length === 1) {
    return `M ${points[0]!.x} ${points[0]!.y}`
  }
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`
  }

  // Start at the first point
  let path = `M ${points[0]!.x} ${points[0]!.y}`

  // Draw a line to the midpoint between first and second point
  const firstMidX = (points[0]!.x + points[1]!.x) / 2
  const firstMidY = (points[0]!.y + points[1]!.y) / 2
  path += ` L ${firstMidX} ${firstMidY}`

  // For each point (except first and last), draw a quadratic curve
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i]!
    const next = points[i + 1]!

    // Calculate midpoint between current and next
    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2

    // Draw quadratic curve: previous midpoint -> current point (control) -> next midpoint
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`
  }

  // Draw line to the last point
  const lastPoint = points[points.length - 1]!
  path += ` L ${lastPoint.x} ${lastPoint.y}`

  return path
}

export function render(
  node: DrawEraserNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: Node) => Node
  },
) {
  const points = node.points
  const width = node.width

  if (points.length === 0) return null

  // Handle single point case with circle
  if (points.length === 1) {
    const x = points[0]!.x
    const y = points[0]!.y
    const r = width / 2
    const pathData = `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${
      x + r
    } ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`

    return (
      <path
        d={pathData}
        fill="none"
        stroke="#FFFFFF"
        stroke-width={width}
        stroke-linecap="round"
        stroke-linejoin="round"
        shape-rendering="geometricPrecision"
      />
    )
  }

  const pathData = createSmoothPath(points)

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#FFFFFF"
      stroke-width={width}
      stroke-linecap="round"
      stroke-linejoin="round"
      shape-rendering="geometricPrecision"
    />
  )
}

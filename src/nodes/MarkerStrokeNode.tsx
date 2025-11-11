import type { MarkerStroke, StrokePoint, StrokeOptions } from "../types"
import * as Unique from "../Unique.ts"
import type { Node, MarkerStrokeNode } from "./index.ts"

export const Type = "MarkerStrokeNode"

export function make(props: {
  stroke: Omit<MarkerStroke, "bounds">
}): MarkerStrokeNode {
  return {
    id: Unique.token(16),
    type: Type,
    parent: null,
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    locked: false,
    stroke: props.stroke,
  }
}

function createSmoothPath(points: StrokePoint[]): string {
  if (points.length === 0) return ""
  if (points.length === 1) {
    return `M ${points[0]!.x} ${points[0]!.y}`
  }
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`
  }

  let path = `M ${points[0]!.x} ${points[0]!.y}`

  const firstMidX = (points[0]!.x + points[1]!.x) / 2
  const firstMidY = (points[0]!.y + points[1]!.y) / 2
  path += ` L ${firstMidX} ${firstMidY}`

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i]!
    const next = points[i + 1]!

    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2

    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`
  }

  const lastPoint = points[points.length - 1]!
  path += ` L ${lastPoint.x} ${lastPoint.y}`

  return path
}

function renderMarkerStroke(
  points: StrokePoint[],
  options: StrokeOptions,
) {
  if (points.length === 0) return null

  if (points.length === 1) {
    const x = points[0]!.x
    const y = points[0]!.y
    const r = options.width / 2
    const pathData = `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`
    
    return (
      <path
        d={pathData}
        fill={options.color}
        fill-opacity={options.opacity ?? 1}
        shape-rendering="geometricPrecision"
      />
    )
  }

  const pathData = createSmoothPath(points)

  return (
    <path
      d={pathData}
      fill="none"
      stroke={options.color}
      stroke-width={options.width}
      stroke-opacity={options.opacity ?? 1}
      stroke-linecap="round"
      stroke-linejoin="round"
      shape-rendering="geometricPrecision"
    />
  )
}

export function render(
  node: MarkerStrokeNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: Node) => Node
  },
) {
  const options = {
    width: node.stroke.width,
    color: node.stroke.color,
    opacity: node.stroke.opacity,
  }

  return renderMarkerStroke(node.stroke.points, options)
}
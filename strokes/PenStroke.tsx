import type { JSX } from "solid-js"
import type { StrokePoint } from "../types"
import type { StrokeOptions } from "./types"

export function path(
  points: StrokePoint[],
  options: { width: number },
): string {
  let processedPoints = [...points]

  processedPoints = applySpacing(processedPoints, Params.spacing)
  processedPoints = applyVibration(processedPoints, Params.vibration)

  if (processedPoints.length === 0) return ""

  if (processedPoints.length === 1) {
    const width = calculateStrokeWidth(processedPoints[0]!, options.width) / 2
    const x = processedPoints[0]!.x
    const y = processedPoints[0]!.y
    return `M ${x - width} ${y} A ${width} ${width} 0 1 1 ${
      x + width
    } ${y} A ${width} ${width} 0 1 1 ${x - width} ${y} Z`
  }

  if (processedPoints.length === 2) {
    const p1 = processedPoints[0]!
    const p2 = processedPoints[1]!
    const width1 = calculateStrokeWidth(p1, options.width) / 2
    const width2 = calculateStrokeWidth(p2, options.width) / 2

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return ""

    const perpX = -dy / length
    const perpY = dx / length

    const p1Left = { x: p1.x + perpX * width1, y: p1.y + perpY * width1 }
    const p1Right = { x: p1.x - perpX * width1, y: p1.y - perpY * width1 }
    const p2Left = { x: p2.x + perpX * width2, y: p2.y + perpY * width2 }
    const p2Right = { x: p2.x - perpX * width2, y: p2.y - perpY * width2 }

    return `M ${p1Left.x} ${p1Left.y} L ${p2Left.x} ${p2Left.y} L ${p2Right.x} ${p2Right.y} L ${p1Right.x} ${p1Right.y} Z`
  }

  // Multiple points - create variable-width outline
  const leftSide: { x: number; y: number }[] = []
  const rightSide: { x: number; y: number }[] = []

  for (let i = 0; i < processedPoints.length; i++) {
    const point = processedPoints[i]!
    let width = calculateStrokeWidth(point, options.width) / 2

    // Apply tapering
    const t = i / (processedPoints.length - 1)
    const taperEnd = Params.taperEnd
    if (t > 1 - taperEnd && taperEnd > 0) {
      width *= (1 - t) / taperEnd
    }

    let perpX = 0, perpY = 0

    if (i === 0) {
      const nextPoint = processedPoints[i + 1]!
      const dx = nextPoint.x - point.x
      const dy = nextPoint.y - point.y
      const length = Math.sqrt(dx * dx + dy * dy)
      if (length > 0) {
        perpX = -dy / length
        perpY = dx / length
      }
    } else if (i === processedPoints.length - 1) {
      const prevPoint = processedPoints[i - 1]!
      const dx = point.x - prevPoint.x
      const dy = point.y - prevPoint.y
      const length = Math.sqrt(dx * dx + dy * dy)
      if (length > 0) {
        perpX = -dy / length
        perpY = dx / length
      }
    } else {
      const prevPoint = processedPoints[i - 1]!
      const nextPoint = processedPoints[i + 1]!
      const dx = nextPoint.x - prevPoint.x
      const dy = nextPoint.y - prevPoint.y
      const length = Math.sqrt(dx * dx + dy * dy)
      if (length > 0) {
        perpX = -dy / length
        perpY = dx / length
      }
    }

    leftSide.push({
      x: point.x + perpX * width,
      y: point.y + perpY * width,
    })
    rightSide.push({
      x: point.x - perpX * width,
      y: point.y - perpY * width,
    })
  }

  if (leftSide.length === 0) return ""

  const smoothLeftPath = createSmoothPath(leftSide)

  // Start with the left side
  let pathData = smoothLeftPath

  // Add smooth curve for right side (in reverse)
  if (rightSide.length > 1) {
    const reversedRight = [...rightSide].reverse()

    // Draw line to first midpoint on right side
    const firstMidX = (reversedRight[0]!.x + reversedRight[1]!.x) / 2
    const firstMidY = (reversedRight[0]!.y + reversedRight[1]!.y) / 2
    pathData += ` L ${firstMidX} ${firstMidY}`

    // Create smooth path for right side using quadratic curves
    for (let i = 1; i < reversedRight.length - 1; i++) {
      const current = reversedRight[i]!
      const next = reversedRight[i + 1]!

      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2

      pathData += ` Q ${current.x} ${current.y} ${midX} ${midY}`
    }

    // Draw line to the last point
    pathData += ` L ${reversedRight[reversedRight.length - 1]!.x} ${
      reversedRight[reversedRight.length - 1]!.y
    }`
  }

  pathData += " Z"
  return pathData
}

export function render(
  points: StrokePoint[],
  options: StrokeOptions,
) {
  const pathData = path(points, options)

  return (
    <path
      d={pathData}
      fill={options.color}
      fill-opacity={1.0}
      shape-rendering="geometricPrecision"
    />
  )
}

const Params = {
  spacing: 0.15,
  vibration: 0.0,
  taperEnd: 0,
  thinning: 0.6,
  pressureRange: [0.5, 1.5] as [number, number],
}

// Apply linear pressure mapping
function applyLinearPressureMapping(
  pressure: number,
  range: [number, number],
): number {
  const [min, max] = range
  return min + pressure * (max - min)
}

// Calculate stroke width at a point based on pressure
function calculateStrokeWidth(
  point: StrokePoint,
  baseWidth: number,
): number {
  const pressure = point.pressure ?? 0.5

  const pressureMultiplier = applyLinearPressureMapping(
    pressure,
    Params.pressureRange,
  )

  // Apply thinning: width = baseSize * (1 - thinning + thinning * pressureMultiplier)
  const width = baseWidth
    * (1 - Params.thinning + Params.thinning * pressureMultiplier)

  return Math.max(0.5, width)
}

// Apply spacing to points - sample at regular intervals
function applySpacing(
  points: StrokePoint[],
  spacing: number,
): StrokePoint[] {
  if (points.length < 2) return points

  const sampledPoints: StrokePoint[] = [points[0]!]
  let accumulatedDistance = 0

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!
    const curr = points[i]!

    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    accumulatedDistance += distance

    if (accumulatedDistance >= spacing) {
      sampledPoints.push(curr)
      accumulatedDistance = 0
    }
  }

  // Always include last point
  if (sampledPoints[sampledPoints.length - 1] !== points[points.length - 1]) {
    sampledPoints.push(points[points.length - 1]!)
  }

  return sampledPoints
}

// apply perpendicular jitter to points
function applyVibration(
  points: StrokePoint[],
  vibration: number,
): StrokePoint[] {
  if (vibration === 0 || points.length < 2) return points

  return points.map((point, i) => {
    if (i === 0 || i === points.length - 1) return point

    const prev = points[i - 1]!
    const next = points[i + 1]!

    // Calculate perpendicular direction
    const dx = next.x - prev.x
    const dy = next.y - prev.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return point

    const perpX = -dy / length
    const perpY = dx / length

    // Random jitter amount
    const jitter = (Math.random() - 0.5) * 2 * vibration

    return {
      ...point,
      x: point.x + perpX * jitter,
      y: point.y + perpY * jitter,
    }
  })
}

// create smooth curve through points using quadratic Bézier curves
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ""
  if (points.length === 1) {
    return `M ${points[0]!.x} ${points[0]!.y}`
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

    // Draw quadratic curve
    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`
  }

  // Draw line to the last point
  const lastPoint = points[points.length - 1]!
  path += ` L ${lastPoint.x} ${lastPoint.y}`

  return path
}

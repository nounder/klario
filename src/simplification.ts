import type { StrokePoint } from "../types"

// Douglas-Peucker algorithm for stroke simplification

/**
 * Calculate perpendicular distance from a point to a line segment
 */
const perpendicularDistance = (
  point: StrokePoint,
  lineStart: StrokePoint,
  lineEnd: StrokePoint,
): number => {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y

  // If the line segment is just a point, return distance to that point
  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2,
    )
  }

  // Calculate perpendicular distance
  const numerator = Math.abs(
    dy * point.x - dx * point.y + lineEnd.x * lineStart.y
      - lineEnd.y * lineStart.x,
  )
  const denominator = Math.sqrt(dx * dx + dy * dy)

  return numerator / denominator
}

/**
 * Douglas-Peucker algorithm implementation
 * Recursively simplifies a polyline by removing points within epsilon distance
 */
const douglasPeucker = (
  points: StrokePoint[],
  epsilon: number,
): StrokePoint[] => {
  if (points.length <= 2) {
    return points
  }

  const firstPoint = points[0]!
  const lastPoint = points[points.length - 1]!

  // Find the point with maximum distance from the line
  let maxDistance = 0
  let maxIndex = 0

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i]!, firstPoint, lastPoint)
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDistance > epsilon) {
    const leftSegment = douglasPeucker(points.slice(0, maxIndex + 1), epsilon)
    const rightSegment = douglasPeucker(points.slice(maxIndex), epsilon)

    // Combine results, avoiding duplicate middle point
    return [...leftSegment.slice(0, -1), ...rightSegment]
  } else {
    // If max distance is less than epsilon, return endpoints only
    return [firstPoint, lastPoint]
  }
}

/**
 * Simplify a stroke using the Douglas-Peucker algorithm
 * @param points - Array of stroke points to simplify
 * @param epsilon - Tolerance value (higher = more simplification)
 * @returns Simplified array of points
 */
export const simplifyStroke = (
  points: StrokePoint[],
  epsilon: number,
): StrokePoint[] => {
  if (points.length <= 2) {
    return points
  }
  return douglasPeucker(points, epsilon)
}


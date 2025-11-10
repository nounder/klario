import type { Bounds, StrokePoint } from "./types.ts"

export function calculateBoundsFromPoints(
  points: StrokePoint[],
  padding: number = 50,
): Bounds {
  const xs = points.map((p: StrokePoint) => p.x)
  const ys = points.map((p: StrokePoint) => p.y)

  const minX = Math.min(...xs) - padding
  const minY = Math.min(...ys) - padding
  const maxX = Math.max(...xs) + padding
  const maxY = Math.max(...ys) + padding

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function mergeBounds(bounds1: Bounds | null, bounds2: Bounds): Bounds {
  if (!bounds1) return bounds2

  const newMinX = Math.min(bounds1.x, bounds2.x)
  const newMinY = Math.min(bounds1.y, bounds2.y)

  const newMaxX = Math.max(
    bounds1.x + bounds1.width,
    bounds2.x + bounds2.width,
  )
  const newMaxY = Math.max(
    bounds1.y + bounds1.height,
    bounds2.y + bounds2.height,
  )

  return {
    x: newMinX,
    y: newMinY,
    width: newMaxX - newMinX,
    height: newMaxY - newMinY,
  }
}

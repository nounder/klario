import { For } from "solid-js"
import type { Path, Point, ViewBox } from "./types"

export default function Canvas(props: {
  paths: Path[]
  currentPath: Point[]
  viewBox: ViewBox
  color: string
  brushWidth: number
  spacePressed: boolean
  isPanning: boolean
  pressureSensitive: boolean
  onRef: (el: SVGSVGElement | undefined) => void
  onPointerDown: (e: PointerEvent) => void
  onPointerMove: (e: PointerEvent) => void
  onPointerUp: () => void
  onPointerLeave: () => void
  pointsToPath: (points: Point[]) => string
  getStrokeWidth: (point: Point, baseBrushWidth: number) => number
  getStrokeOpacity: (point: Point) => number
  getStrokeDasharray: (point: Point) => string | undefined
}) {
  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        ref={props.onRef}
        width="100%"
        height="100%"
        viewBox={`${props.viewBox.x} ${props.viewBox.y} ${props.viewBox.width} ${props.viewBox.height}`}
        style={{
          background: "white",
          cursor: props.spacePressed
            ? "grab"
            : props.isPanning
            ? "grabbing"
            : "crosshair",
          "touch-action": "none",
        }}
        onPointerDown={props.onPointerDown as any}
        onPointerMove={props.onPointerMove as any}
        onPointerUp={props.onPointerUp}
        onPointerLeave={props.onPointerLeave}
      >
        {/* Render completed paths */}
        <For each={props.paths}>
          {(path) => {
            if (path.pressureSensitive && path.points.length > 1) {
              // Render pressure-sensitive path as multiple segments
              return (
                <g>
                  <For each={path.points.slice(0, -1)}>
                    {(point, index) => {
                      const nextPoint = path.points[index() + 1]
                      if (!nextPoint) return null
                      
                      const avgPressure = ((point.pressure || 0.5) + (nextPoint.pressure || 0.5)) / 2
                      const avgPoint = { ...point, pressure: avgPressure }
                      const strokeWidth = props.getStrokeWidth(avgPoint, path.width)
                      const strokeOpacity = props.getStrokeOpacity(avgPoint)
                      const strokeDasharray = props.getStrokeDasharray(avgPoint)
                      
                      return (
                        <line
                          x1={point.x}
                          y1={point.y}
                          x2={nextPoint.x}
                          y2={nextPoint.y}
                          stroke={path.color}
                          stroke-width={strokeWidth}
                          stroke-opacity={strokeOpacity}
                          stroke-dasharray={strokeDasharray}
                          stroke-linecap="round"
                        />
                      )
                    }}
                  </For>
                </g>
              )
            } else {
              // Render normal path
              return (
                <path
                  d={props.pointsToPath(path.points)}
                  stroke={path.color}
                  stroke-width={path.width}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                />
              )
            }
          }}
        </For>

        {/* Render current path being drawn */}
        {props.currentPath.length > 0 && (() => {
          const isPenPath = props.currentPath.some(point => point.pointerType === 'pen')
          
          if (isPenPath && props.pressureSensitive && props.currentPath.length > 1) {
            // Render pressure-sensitive current path
            return (
              <g>
                <For each={props.currentPath.slice(0, -1)}>
                  {(point, index) => {
                    const nextPoint = props.currentPath[index() + 1]
                    if (!nextPoint) return null
                    
                    const avgPressure = ((point.pressure || 0.5) + (nextPoint.pressure || 0.5)) / 2
                    const avgPoint = { ...point, pressure: avgPressure }
                    const strokeWidth = props.getStrokeWidth(avgPoint, props.brushWidth)
                    const strokeOpacity = props.getStrokeOpacity(avgPoint)
                    const strokeDasharray = props.getStrokeDasharray(avgPoint)
                    
                    return (
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={nextPoint.x}
                        y2={nextPoint.y}
                        stroke={props.color}
                        stroke-width={strokeWidth}
                        stroke-opacity={strokeOpacity}
                        stroke-dasharray={strokeDasharray}
                        stroke-linecap="round"
                      />
                    )
                  }}
                </For>
              </g>
            )
          } else {
            // Render normal current path
            return (
              <path
                d={props.pointsToPath(props.currentPath)}
                stroke={props.color}
                stroke-width={props.brushWidth}
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            )
          }
        })()}
      </svg>
    </div>
  )
}

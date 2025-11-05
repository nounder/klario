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
  pointsToVariableWidthPath: (points: Point[], baseBrushWidth: number) => string
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
        class={
          props.spacePressed
            ? "space-pressed"
            : props.isPanning
            ? "panning"
            : "drawing"
        }
        onPointerDown={props.onPointerDown as any}
        onPointerMove={props.onPointerMove as any}
        onPointerUp={props.onPointerUp}
        onPointerLeave={props.onPointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Render completed paths */}
        <For each={props.paths}>
          {(path) => {
            if (path.pressureSensitive && path.points.length > 0) {
              // Try to render pressure-sensitive path as single filled path
              const variableWidthPath = props.pointsToVariableWidthPath(path.points, path.width)
              const avgOpacity = path.points.length > 0 
                ? path.points.reduce((sum, point) => sum + props.getStrokeOpacity(point), 0) / path.points.length
                : 1.0
              
              // Fallback to regular stroked path if variable width path generation fails
              if (variableWidthPath && variableWidthPath.length > 0) {
                return (
                  <path
                    d={variableWidthPath}
                    fill={path.color}
                    fill-opacity={avgOpacity}
                  />
                )
              } else {
                // Fallback: render as regular stroked path with average pressure width
                const avgPressureWidth = path.points.length > 0
                  ? path.points.reduce((sum, point) => sum + props.getStrokeWidth(point, path.width), 0) / path.points.length
                  : path.width
                
                return (
                  <path
                    d={props.pointsToPath(path.points)}
                    stroke={path.color}
                    stroke-width={avgPressureWidth}
                    stroke-opacity={avgOpacity}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                )
              }
            } else {
              // Render normal stroked path
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
          
          if (isPenPath && props.pressureSensitive && props.currentPath.length > 0) {
            // Try to render pressure-sensitive current path as single filled path
            const variableWidthPath = props.pointsToVariableWidthPath(props.currentPath, props.brushWidth)
            const avgOpacity = props.currentPath.length > 0 
              ? props.currentPath.reduce((sum, point) => sum + props.getStrokeOpacity(point), 0) / props.currentPath.length
              : 1.0
            
            // Fallback to regular stroked path if variable width path generation fails
            if (variableWidthPath && variableWidthPath.length > 0) {
              return (
                <path
                  d={variableWidthPath}
                  fill={props.color}
                  fill-opacity={avgOpacity}
                />
              )
            } else {
              // Fallback: render as regular stroked path with average pressure width
              const avgPressureWidth = props.currentPath.length > 0
                ? props.currentPath.reduce((sum, point) => sum + props.getStrokeWidth(point, props.brushWidth), 0) / props.currentPath.length
                : props.brushWidth
              
              return (
                <path
                  d={props.pointsToPath(props.currentPath)}
                  stroke={props.color}
                  stroke-width={avgPressureWidth}
                  stroke-opacity={avgOpacity}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                />
              )
            }
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

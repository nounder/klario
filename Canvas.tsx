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
  onRef: (el: SVGSVGElement | undefined) => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: () => void
  pointsToPath: (points: Point[]) => string
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
        onMouseDown={props.onMouseDown as any}
        onMouseMove={props.onMouseMove as any}
        onMouseUp={props.onMouseUp}
        onMouseLeave={props.onMouseLeave}
        onTouchStart={props.onTouchStart as any}
        onTouchMove={props.onTouchMove as any}
        onTouchEnd={props.onTouchEnd}
      >
        {/* Render completed paths */}
        <For each={props.paths}>
          {(path) => (
            <path
              d={props.pointsToPath(path.points)}
              stroke={path.color}
              stroke-width={path.width}
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          )}
        </For>

        {/* Render current path being drawn */}
        {props.currentPath.length > 0 && (
          <path
            d={props.pointsToPath(props.currentPath)}
            stroke={props.color}
            stroke-width={props.brushWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  )
}

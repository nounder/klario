import { createMemo, For } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"
import { simplifyStroke } from "./simplification"
import * as MarkerStroke from "./strokes/MarkerStroke.tsx"
import * as PenStroke from "./strokes/PenStroke.tsx"
import type { AppState, Bounds, Stroke, StrokePoint } from "./types"

// Simple point type for panning coordinates
type Point = { x: number; y: number }

export interface CanvasProps {
  store: AppState
  setStore: SetStoreFunction<AppState>
}

export default function Canvas(props: CanvasProps) {
  const store = props.store
  const setStore = props.setStore

  let svgRef: SVGSVGElement | undefined

  // Get screen/client coordinates for panning
  const getScreenCoordinates = (e: PointerEvent): Point => {
    return { x: e.clientX, y: e.clientY }
  }

  // Get SVG coordinates for drawing (accounts for viewBox)
  const getCoordinates = (e: PointerEvent): StrokePoint => {
    if (!svgRef) return { x: 0, y: 0 }
    const rect = svgRef.getBoundingClientRect()

    const clientX = e.clientX
    const clientY = e.clientY

    // Convert screen coordinates to SVG viewBox coordinates
    const relativeX = (clientX - rect.left) / rect.width
    const relativeY = (clientY - rect.top) / rect.height

    const point: StrokePoint = {
      x: store.viewBox.x + relativeX * store.viewBox.width,
      y: store.viewBox.y + relativeY * store.viewBox.height,
    }

    // Add pressure if available
    if (e.pressure > 0) {
      point.pressure = e.pressure
    }

    // Add stylus-specific properties if available
    if (e.pointerType === "pen") {
      point.tiltX = e.tiltX || 0
      point.tiltY = e.tiltY || 0
      point.twist = e.twist || 0
    }

    return point
  }

  const handlePointerDown = (event: PointerEvent) => {
    const target = event.target as Element
    target.setPointerCapture(event.pointerId)
    event.preventDefault()
    event.stopPropagation()
  }

  const releasePointer = (event: PointerEvent) => {
    try {
      const target = event.target as Element
      target.releasePointerCapture(event.pointerId)
    } catch (e) {
      // Ignore errors if pointer was already released
    }
  }

  const startDrawing = (e: PointerEvent) => {
    if (
      store.isDrawing
      && store.activePointerId !== null
      && store.activePointerId !== e.pointerId
    ) {
      return
    }

    handlePointerDown(e)

    if (store.isPanning) {
      startPanning(e)
      return
    }

    const point = getCoordinates(e)
    setStore({
      isDrawing: true,
      activePointerId: e.pointerId,
      currentPath: [point],
    })
  }

  const draw = (e: PointerEvent) => {
    if (store.isPanning) {
      pan(e)
      return
    }
    if (!store.isDrawing || store.activePointerId !== e.pointerId) return
    e.preventDefault()
    const point = getCoordinates(e)
    setStore("currentPath", (prev) => [...prev, point])
  }

  const stopDrawing = (e?: PointerEvent) => {
    if (store.isPanning && store.panStart) {
      stopPanning()
      return
    }

    if (
      e
      && store.activePointerId !== null
      && store.activePointerId !== e.pointerId
    ) {
      return
    }

    if (store.isDrawing && store.currentPath.length > 0) {
      // Apply Douglas-Peucker simplification to reduce point count
      // Epsilon is adaptive: smaller for pen (more detail), larger for marker
      const epsilonMultiplier = store.currentStrokeType === "pen"
        ? 0.3
        : 0.5
      const epsilon = epsilonMultiplier * Math.max(1, store.inkWidth / 10)

      const originalCount = store.currentPath.length
      const simplifiedPoints = simplifyStroke(store.currentPath, epsilon)
      const simplifiedCount = simplifiedPoints.length
      const reduction = (
        (originalCount - simplifiedCount) / originalCount * 100
      )
        .toFixed(1)

      console.log(
        `🎨 Douglas-Peucker: ${originalCount} → ${simplifiedCount} points (${reduction}% reduction, epsilon: ${
          epsilon.toFixed(2)
        })`,
      )

      const bounds = calculateBounds(simplifiedPoints)

      const newStroke: Stroke = {
        type: store.currentStrokeType,
        points: simplifiedPoints,
        color: store.color,
        width: store.inkWidth,
        bounds,
      }

      setStore("strokes", (strokes) => [...strokes, newStroke])
      setStore("currentPath", [])
      setStore("isDrawing", false)
      setStore("activePointerId", null)
    } else {
      setStore("isDrawing", false)
      setStore("activePointerId", null)
    }

    if (e) {
      releasePointer(e)
    }
  }

  const cancelDrawing = (e: PointerEvent) => {
    if (store.activePointerId === e.pointerId) {
      setStore({
        isDrawing: false,
        activePointerId: null,
        currentPath: [],
      })
      releasePointer(e)
    }
  }

  // Calculate bounds for a stroke
  const calculateBounds = (points: StrokePoint[]): Bounds => {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    const padding = store.inkWidth * 2 + 10

    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)

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

  // Calculate the bounding box of all strokes
  const canvasBounds = createMemo((): Bounds | null => {
    const allPoints: StrokePoint[] = []

    store.strokes.forEach((stroke) => {
      allPoints.push(...stroke.points)
    })

    if (store.currentPath.length > 0) {
      allPoints.push(...store.currentPath)
    }

    if (allPoints.length === 0) return null

    const padding = 50
    const xs = allPoints.map(p => p.x)
    const ys = allPoints.map(p => p.y)

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
  })

  // Check if panning should be enabled
  const canPan = createMemo((): boolean => {
    const bounds = canvasBounds()
    if (!bounds) return false

    return (
      bounds.width > store.viewBox.width || bounds.height > store.viewBox.height
    )
  })

  // Update viewBox based on current SVG size
  const updateViewBox = () => {
    if (!svgRef) return
    const rect = svgRef.getBoundingClientRect()
    setStore("viewBox", (vb) => ({
      ...vb,
      width: rect.width,
      height: rect.height,
    }))
  }

  // Panning functions
  const startPanning = (e: PointerEvent) => {
    if (!canPan()) return
    e.preventDefault()
    const point = getScreenCoordinates(e)
    setStore("panStart", point)
  }

  const pan = (e: PointerEvent) => {
    if (!store.isPanning || !store.panStart || !svgRef) return
    e.preventDefault()

    const point = getScreenCoordinates(e)
    const rect = svgRef.getBoundingClientRect()

    const screenDx = point.x - store.panStart.x
    const screenDy = point.y - store.panStart.y
    const viewBoxDx = (screenDx / rect.width) * store.viewBox.width
    const viewBoxDy = (screenDy / rect.height) * store.viewBox.height

    setStore("viewBox", (vb) => {
      const bounds = canvasBounds()

      let newX = vb.x - viewBoxDx
      let newY = vb.y - viewBoxDy

      if (bounds && canPan()) {
        if (bounds.width > vb.width) {
          newX = Math.max(
            bounds.x,
            Math.min(bounds.x + bounds.width - vb.width, newX),
          )
        } else {
          newX = vb.x
        }

        if (bounds.height > vb.height) {
          newY = Math.max(
            bounds.y,
            Math.min(bounds.y + bounds.height - vb.height, newY),
          )
        } else {
          newY = vb.y
        }
      }

      return {
        ...vb,
        x: newX,
        y: newY,
      }
    })

    setStore("panStart", point)
  }

  const stopPanning = () => {
    setStore("panStart", null)
  }

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !store.isPanning) {
      e.preventDefault()
      setStore("isPanning", true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault()
      setStore("isPanning", false)
      setStore("panStart", null)
    }
  }

  // Set up event listeners
  const setupEventListeners = () => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("resize", updateViewBox)
  }

  // Initialize on mount
  const initializeViewBox = (el: SVGSVGElement | undefined) => {
    if (!el) return
    svgRef = el
    setupEventListeners()

    setTimeout(() => {
      if (!svgRef) return
      const rect = svgRef.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setStore("viewBox", {
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height,
        })
      }
    }, 0)
  }

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        ref={initializeViewBox}
        width="100%"
        height="100%"
        viewBox={`${store.viewBox.x} ${store.viewBox.y} ${store.viewBox.width} ${store.viewBox.height}`}
        classList={{
          panning: store.isPanning && store.panStart !== null,
          drawing: !store.isPanning,
        }}
        style={{
          cursor: store.isPanning && store.panStart === null
            ? "grab"
            : undefined,
        }}
        onPointerDown={(e) => startDrawing(e)}
        onPointerMove={(e) => draw(e)}
        onPointerUp={(e) => stopDrawing(e)}
        onPointerLeave={(e) => stopDrawing(e)}
        onPointerCancel={(e) => cancelDrawing(e)}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Render completed strokes */}
        <For each={store.strokes}>
          {(stroke) => {
            const options = { width: stroke.width, color: stroke.color }

            if (stroke.type === "marker") {
              return MarkerStroke.render(stroke.points, options)
            }

            return PenStroke.render(stroke.points, options)
          }}
        </For>

        {/* Render current path being drawn */}
        {store.currentPath.length > 0 && (() => {
          const options = { width: store.inkWidth, color: store.color }

          if (store.currentStrokeType === "marker") {
            return (
              <g style={{ "will-change": "transform" }}>
                {MarkerStroke.render(store.currentPath, options)}
              </g>
            )
          }

          return (
            <g
              style={{
                "will-change": "transform",
              }}
            >
              {PenStroke.render(store.currentPath, options)}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

import { createMemo, For } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"
import type { AppState, Bounds, Point } from "./types"

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
  const getCoordinates = (e: PointerEvent): Point => {
    if (!svgRef) return { x: 0, y: 0 }
    const rect = svgRef.getBoundingClientRect()

    const clientX = e.clientX
    const clientY = e.clientY

    // Convert screen coordinates to SVG viewBox coordinates
    const relativeX = (clientX - rect.left) / rect.width
    const relativeY = (clientY - rect.top) / rect.height

    const point: Point = {
      x: store.viewBox.x + relativeX * store.viewBox.width,
      y: store.viewBox.y + relativeY * store.viewBox.height,
    }

    // Add Apple Pencil/pen-specific properties if available
    if (e.pointerType === "pen") {
      point.pressure = e.pressure || 0.5
      point.tiltX = e.tiltX || 0
      point.tiltY = e.tiltY || 0
      point.twist = e.twist || 0
      point.altitudeAngle = e.altitudeAngle || 0
      point.azimuthAngle = e.azimuthAngle || 0
      point.pointerType = e.pointerType
    }

    return point
  }

  const handlePointerDown = (event: PointerEvent) => {
    // Capture pointer to ensure we receive all events
    const target = event.target as Element
    target.setPointerCapture(event.pointerId)

    // Prevent event bubbling that might cause delays
    event.preventDefault()
    event.stopPropagation()
  }

  const releasePointer = (event: PointerEvent) => {
    // Release pointer capture when done
    try {
      const target = event.target as Element
      target.releasePointerCapture(event.pointerId)
    } catch (e) {
      // Ignore errors if pointer was already released
    }
  }

  const startDrawing = (e: PointerEvent) => {
    // If another pointer is already active, ignore this one
    if (
      store.isDrawing && store.activePointerId !== null && store
          .activePointerId !== e.pointerId
    ) {
      return
    }

    // Apply pointer capture first
    handlePointerDown(e)

    if (store.spacePressed) {
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
    // Only process events from the active pointer
    if (!store.isDrawing || store.activePointerId !== e.pointerId) return
    e.preventDefault()
    const point = getCoordinates(e)
    setStore("currentPath", (prev) => [...prev, point])
  }

  const stopDrawing = (e?: PointerEvent) => {
    if (store.isPanning) {
      stopPanning()
      return
    }
    // Only stop if this is the active pointer or no pointer specified
    if (
      e && store.activePointerId !== null && store
          .activePointerId !== e.pointerId
    ) {
      return
    }

    if (store.isDrawing && store.currentPath.length > 0) {
      const isPenPath = store.currentPath.some(point =>
        point.pointerType === "pen"
      )
      const newPath = {
        points: [...store.currentPath],
        color: store.color,
        width: store.brushWidth,
        isPenPath,
        pressureSensitive: isPenPath && store.pressureSensitive,
      }
      setStore("paths", (paths) => [...paths, newPath])
      setStore("currentPath", [])
      setStore("isDrawing", false)
      setStore("activePointerId", null)
    } else {
      setStore("isDrawing", false)
      setStore("activePointerId", null)
    }

    // Release pointer capture
    if (e) {
      releasePointer(e)
    }
  }

  const cancelDrawing = (e: PointerEvent) => {
    // Cancel current drawing and release pointer
    if (store.activePointerId === e.pointerId) {
      setStore({
        isDrawing: false,
        activePointerId: null,
        currentPath: [],
      })
      releasePointer(e)
    }
  }



  // Calculate the bounding box of all paths (computed signal)
  const canvasBounds = createMemo((): Bounds | null => {
    const allPoints: Point[] = []

    store.paths.forEach((path) => {
      allPoints.push(...path.points)
    })

    if (store.currentPath.length > 0) {
      allPoints.push(...store.currentPath)
    }

    if (allPoints.length === 0) return null

    const padding = 50
    return {
      minX: Math.min(...allPoints.map((p) => p.x)) - padding,
      minY: Math.min(...allPoints.map((p) => p.y)) - padding,
      maxX: Math.max(...allPoints.map((p) => p.x)) + padding,
      maxY: Math.max(...allPoints.map((p) => p.y)) + padding,
    }
  })

  // Check if panning should be enabled (content is larger than viewport)
  const canPan = createMemo((): boolean => {
    const bounds = canvasBounds()
    if (!bounds) return false

    const contentWidth = bounds.maxX - bounds.minX
    const contentHeight = bounds.maxY - bounds.minY

    return (
      contentWidth > store.viewBox.width || contentHeight > store.viewBox.height
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

  // Start panning
  const startPanning = (e: PointerEvent) => {
    if (!store.spacePressed || !canPan()) return
    e.preventDefault()
    const point = getScreenCoordinates(e)
    setStore({
      isPanning: true,
      panStart: point,
    })
  }

  // Pan the view
  const pan = (e: PointerEvent) => {
    if (!store.isPanning || !store.panStart || !svgRef) return
    e.preventDefault()

    const point = getScreenCoordinates(e)
    const rect = svgRef.getBoundingClientRect()

    // Convert screen pixel delta to viewBox coordinate delta
    const screenDx = point.x - store.panStart.x
    const screenDy = point.y - store.panStart.y
    const viewBoxDx = (screenDx / rect.width) * store.viewBox.width
    const viewBoxDy = (screenDy / rect.height) * store.viewBox.height

    setStore("viewBox", (vb) => {
      const bounds = canvasBounds()

      // Apply pan (negative because we're moving the viewBox, not the content)
      let newX = vb.x - viewBoxDx
      let newY = vb.y - viewBoxDy

      // Clamp viewBox to canvas bounds only if content is larger than viewport
      if (bounds && canPan()) {
        const contentWidth = bounds.maxX - bounds.minX
        const contentHeight = bounds.maxY - bounds.minY

        // Only clamp in directions where content exceeds viewport
        if (contentWidth > vb.width) {
          newX = Math.max(
            bounds.minX,
            Math.min(bounds.maxX - vb.width, newX),
          )
        } else {
          // Content fits horizontally, don't pan in this direction
          newX = vb.x
        }

        if (contentHeight > vb.height) {
          newY = Math.max(
            bounds.minY,
            Math.min(bounds.maxY - vb.height, newY),
          )
        } else {
          // Content fits vertically, don't pan in this direction
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

  // Stop panning
  const stopPanning = () => {
    setStore({
      isPanning: false,
      panStart: null,
    })
  }

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !store.spacePressed) {
      e.preventDefault()
      setStore("spacePressed", true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault()
      setStore("spacePressed", false)
      stopPanning()
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

    // Initial viewBox setup - set to actual SVG size
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

  const pointsToPath = (points: Point[]): string => {
    if (points.length === 0) return ""
    if (points.length === 1) {
      return `M ${points[0]!.x} ${points[0]!.y} L ${points[0]!.x + 0.1} ${
        points[0]!.y + 0.1
      }`
    }

    let path = `M ${points[0]!.x} ${points[0]!.y}`
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i]!.x} ${points[i]!.y}`
    }
    return path
  }

  // Generate a pressure-sensitive filled path
  const pointsToVariableWidthPath = (
    points: Point[],
    baseBrushWidth: number,
  ): string => {
    if (points.length === 0) return ""

    if (points.length === 1) {
      const width = getStrokeWidth(points[0]!, baseBrushWidth) / 2
      const x = points[0]!.x
      const y = points[0]!.y
      return `M ${x - width} ${y} A ${width} ${width} 0 1 1 ${
        x + width
      } ${y} A ${width} ${width} 0 1 1 ${x - width} ${y} Z`
    }

    if (points.length === 2) {
      // For just two points, create a simple capsule shape
      const p1 = points[0]!
      const p2 = points[1]!
      const width1 = getStrokeWidth(p1, baseBrushWidth) / 2
      const width2 = getStrokeWidth(p2, baseBrushWidth) / 2

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

    // For multiple points, create a more sophisticated path
    try {
      const leftSide: { x: number; y: number }[] = []
      const rightSide: { x: number; y: number }[] = []

      for (let i = 0; i < points.length; i++) {
        const point = points[i]!
        const width = getStrokeWidth(point, baseBrushWidth) / 2

        // Calculate perpendicular direction for stroke width
        let perpX = 0, perpY = 0

        if (i === 0) {
          // First point: use direction to next point
          const nextPoint = points[i + 1]!
          const dx = nextPoint.x - point.x
          const dy = nextPoint.y - point.y
          const length = Math.sqrt(dx * dx + dy * dy)
          if (length > 0) {
            perpX = -dy / length
            perpY = dx / length
          }
        } else if (i === points.length - 1) {
          // Last point: use direction from previous point
          const prevPoint = points[i - 1]!
          const dx = point.x - prevPoint.x
          const dy = point.y - prevPoint.y
          const length = Math.sqrt(dx * dx + dy * dy)
          if (length > 0) {
            perpX = -dy / length
            perpY = dx / length
          }
        } else {
          // Middle point: use perpendicular to line segment
          const prevPoint = points[i - 1]!
          const nextPoint = points[i + 1]!
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

      // Create the path: left side -> right side (reversed) -> close
      let path = `M ${leftSide[0]!.x} ${leftSide[0]!.y}`

      // Draw left side
      for (let i = 1; i < leftSide.length; i++) {
        path += ` L ${leftSide[i]!.x} ${leftSide[i]!.y}`
      }

      // Draw right side in reverse
      for (let i = rightSide.length - 1; i >= 0; i--) {
        path += ` L ${rightSide[i]!.x} ${rightSide[i]!.y}`
      }

      path += " Z"
      return path
    } catch (error) {
      console.error("Error generating variable width path:", error)
      return ""
    }
  }

  // Calculate stroke width based on pressure and tilt
  const getStrokeWidth = (point: Point, baseBrushWidth: number): number => {
    let width = baseBrushWidth

    if (point.pressure !== undefined && store.pressureSensitive) {
      // Map pressure (0-1) to brush width range (baseBrushWidth/4 to maxPressureWidth)
      const minWidth = Math.max(0.5, baseBrushWidth * 0.25)
      const maxWidth = store.maxPressureWidth
      width = minWidth + (point.pressure * (maxWidth - minWidth))
    }

    // Apply tilt effect - when pencil is more tilted, stroke gets wider
    if (
      point.tiltX !== undefined && point.tiltY !== undefined && store
        .tiltSensitive
    ) {
      const tilt = Math.sqrt(
        point.tiltX * point.tiltX + point.tiltY * point.tiltY,
      )
      const maxTilt = 90 // degrees
      const tiltFactor = 1 + (tilt / maxTilt) * 0.5 // up to 50% wider when fully tilted
      width *= tiltFactor
    }

    return width
  }

  // Calculate opacity based on pressure for subtle effect
  const getStrokeOpacity = (point: Point): number => {
    // Always return full opacity to ensure consistent color intensity
    // between pen and finger/mouse input
    return 1.0
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
        class={store.spacePressed
          ? "space-pressed"
          : store.isPanning
          ? "panning"
          : "drawing"}
        onPointerDown={(e) => startDrawing(e)}
        onPointerMove={(e) => draw(e)}
        onPointerUp={(e) => stopDrawing(e)}
        onPointerLeave={(e) => stopDrawing(e)}
        onPointerCancel={(e) => cancelDrawing(e)}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Render completed paths */}
        <For each={store.paths}>
          {(path) => {
            if (path.pressureSensitive && path.points.length > 0) {
              // Try to render pressure-sensitive path as single filled path
              const variableWidthPath = pointsToVariableWidthPath(
                path.points,
                path.width,
              )
              const avgOpacity = path.points.length > 0
                ? path.points.reduce(
                  (sum, point) => sum + getStrokeOpacity(point),
                  0,
                ) / path.points.length
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
                  ? path.points.reduce(
                    (sum, point) => sum + getStrokeWidth(point, path.width),
                    0,
                  ) / path.points.length
                  : path.width

                return (
                  <path
                    d={pointsToPath(path.points)}
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
                  d={pointsToPath(path.points)}
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

        {/* Render current path being drawn as line segments for better performance */}
        <g>
          <For each={store.currentPath.slice(1)}>
            {(point, index) => {
              const prevPoint = store.currentPath[index()]!
              const isPenPath = point.pointerType === "pen"

              // Calculate stroke width for this segment
              const strokeWidth = isPenPath && store.pressureSensitive
                ? (getStrokeWidth(prevPoint, store.brushWidth)
                  + getStrokeWidth(point, store.brushWidth)) / 2
                : store.brushWidth

              // Calculate opacity for this segment
              const strokeOpacity = isPenPath && store.pressureSensitive
                ? (getStrokeOpacity(prevPoint) + getStrokeOpacity(point)) / 2
                : getStrokeOpacity(point)

              return (
                <line
                  x1={prevPoint.x}
                  y1={prevPoint.y}
                  x2={point.x}
                  y2={point.y}
                  stroke={store.color}
                  stroke-width={strokeWidth}
                  stroke-opacity={strokeOpacity}
                  stroke-linecap="round"
                />
              )
            }}
          </For>
        </g>
      </svg>
    </div>
  )
}

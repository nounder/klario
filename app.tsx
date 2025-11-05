import { createMemo, For } from "solid-js"
import { createStore } from "solid-js/store"
import Canvas from "./Canvas"
import type { AppState, Bounds, Point } from "./types"

export default function App() {
  const [store, setStore] = createStore<AppState>({
    paths: [],
    currentPath: [],
    isDrawing: false,
    color: "#000000",
    brushWidth: 3,
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    spacePressed: false,
    isPanning: false,
    panStart: null,
    pressureSensitive: true,
    maxPressureWidth: 20,
    tiltSensitive: true,
  })

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
    if (e.pointerType === 'pen') {
      point.pressure = e.pressure || 0.5
      point.tiltX = e.tiltX || 0
      point.tiltY = e.tiltY || 0
      point.twist = e.twist || 0
      point.altitudeAngle = (e as any).altitudeAngle || 0
      point.azimuthAngle = (e as any).azimuthAngle || 0
      point.pointerType = e.pointerType
    }

    return point
  }

  const startDrawing = (e: PointerEvent) => {
    if (store.spacePressed) {
      startPanning(e)
      return
    }
    e.preventDefault()
    const point = getCoordinates(e)
    setStore({
      isDrawing: true,
      currentPath: [point],
    })
  }

  const draw = (e: PointerEvent) => {
    if (store.isPanning) {
      pan(e)
      return
    }
    if (!store.isDrawing) return
    e.preventDefault()
    const point = getCoordinates(e)
    setStore("currentPath", (prev) => [...prev, point])
  }

  const stopDrawing = () => {
    if (store.isPanning) {
      stopPanning()
      return
    }
    if (store.isDrawing && store.currentPath.length > 0) {
      const isPenPath = store.currentPath.some(point => point.pointerType === 'pen')
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
    } else {
      setStore("isDrawing", false)
    }
  }

  const clearCanvas = () => {
    setStore({
      paths: [],
      currentPath: [],
    })
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
    if (point.tiltX !== undefined && point.tiltY !== undefined && store.tiltSensitive) {
      const tilt = Math.sqrt(point.tiltX * point.tiltX + point.tiltY * point.tiltY)
      const maxTilt = 90 // degrees
      const tiltFactor = 1 + (tilt / maxTilt) * 0.5 // up to 50% wider when fully tilted
      width *= tiltFactor
    }
    
    return width
  }

  // Calculate opacity based on pressure for subtle effect
  const getStrokeOpacity = (point: Point): number => {
    if (point.pressure !== undefined && store.pressureSensitive) {
      // Map pressure to opacity (0.3 to 1.0)
      return 0.3 + (point.pressure * 0.7)
    }
    return 1.0
  }

  // Calculate stroke dash pattern based on twist for textural effects
  const getStrokeDasharray = (point: Point): string | undefined => {
    if (point.twist !== undefined && point.pointerType === 'pen') {
      const normalizedTwist = Math.abs(point.twist) / 180 // 0-1
      if (normalizedTwist > 0.1) {
        // Create a dash pattern that varies with twist
        const dashLength = 2 + (normalizedTwist * 8)
        const gapLength = 1 + (normalizedTwist * 3)
        return `${dashLength} ${gapLength}`
      }
    }
    return undefined
  }

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ]

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          "backdrop-filter": "blur(20px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(20px) saturate(180%)",
          padding: "20px 24px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          "border-radius": "0 0 20px 20px",
          "box-shadow": "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 16px rgba(0, 0, 0, 0.05)",
          display: "flex",
          gap: "20px",
          "align-items": "center",
          "flex-wrap": "wrap",
          position: "relative",
          "z-index": 10,
        }}
      >
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ 
            "font-weight": "600", 
            color: "rgba(0, 0, 0, 0.8)",
            "font-size": "14px",
            "letter-spacing": "0.5px"
          }}>
            Color:
          </label>
          <For each={colors}>
            {(c) => (
              <button
                onClick={() => setStore("color", c)}
                style={{
                  width: "36px",
                  height: "36px",
                  border: store.color === c
                    ? "3px solid rgba(0, 0, 0, 0.6)"
                    : "2px solid rgba(255, 255, 255, 0.3)",
                  background: c,
                  cursor: "pointer",
                  "border-radius": "12px",
                  "box-shadow": store.color === c 
                    ? "0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.5)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.2s ease",
                  transform: store.color === c ? "scale(1.1)" : "scale(1)",
                }}
                title={c}
              />
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ 
            "font-weight": "600", 
            color: "rgba(0, 0, 0, 0.8)",
            "font-size": "14px",
            "letter-spacing": "0.5px"
          }}>
            Brush Size:
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={store.brushWidth}
            onInput={(e) =>
              setStore("brushWidth", parseInt(e.currentTarget.value))}
            style={{ 
              width: "140px",
              height: "6px",
              background: "rgba(255, 255, 255, 0.3)",
              "border-radius": "3px",
              outline: "none",
              appearance: "none",
              "-webkit-appearance": "none",
            }}
          />
          <span style={{ 
            "min-width": "40px",
            "font-weight": "600",
            color: "rgba(0, 0, 0, 0.7)",
            "font-size": "13px",
            background: "rgba(255, 255, 255, 0.5)",
            padding: "4px 8px",
            "border-radius": "8px",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}>
            {store.brushWidth}px
          </span>
        </div>

        {/* Apple Pencil Settings */}
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ 
            "font-weight": "600", 
            color: "rgba(0, 0, 0, 0.8)",
            "font-size": "14px",
            "letter-spacing": "0.5px"
          }}>
            <input
              type="checkbox"
              checked={store.pressureSensitive}
              onChange={(e) => setStore("pressureSensitive", e.currentTarget.checked)}
              style={{ "margin-right": "6px" }}
            />
            Pressure
          </label>
        </div>

        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ 
            "font-weight": "600", 
            color: "rgba(0, 0, 0, 0.8)",
            "font-size": "14px",
            "letter-spacing": "0.5px"
          }}>
            Max Pressure:
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={store.maxPressureWidth}
            onInput={(e) =>
              setStore("maxPressureWidth", parseInt(e.currentTarget.value))}
            style={{ 
              width: "100px",
              height: "6px",
              background: "rgba(255, 255, 255, 0.3)",
              "border-radius": "3px",
              outline: "none",
              appearance: "none",
              "-webkit-appearance": "none",
            }}
          />
          <span style={{ 
            "min-width": "35px",
            "font-weight": "600",
            color: "rgba(0, 0, 0, 0.7)",
            "font-size": "13px",
            background: "rgba(255, 255, 255, 0.5)",
            padding: "4px 8px",
            "border-radius": "8px",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}>
            {store.maxPressureWidth}px
          </span>
        </div>

        <button
          onClick={clearCanvas}
          style={{
            padding: "12px 20px",
            background: "rgba(239, 68, 68, 0.9)",
            "backdrop-filter": "blur(10px)",
            "-webkit-backdrop-filter": "blur(10px)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            "border-radius": "12px",
            cursor: "pointer",
            "font-weight": "600",
            "font-size": "14px",
            "letter-spacing": "0.5px",
            "box-shadow": "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)";
          }}
        >
          Clear Canvas
        </button>
      </div>

      {/* Canvas */}
      <Canvas
        paths={store.paths}
        currentPath={store.currentPath}
        viewBox={store.viewBox}
        color={store.color}
        brushWidth={store.brushWidth}
        spacePressed={store.spacePressed}
        isPanning={store.isPanning}
        pressureSensitive={store.pressureSensitive}
        onRef={initializeViewBox}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        pointsToPath={pointsToPath}
        getStrokeWidth={getStrokeWidth}
        getStrokeOpacity={getStrokeOpacity}
        getStrokeDasharray={getStrokeDasharray}
      />
    </div>
  )
}

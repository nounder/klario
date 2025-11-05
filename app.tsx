import { For } from "solid-js"
import { createStore } from "solid-js/store"
import { render } from "solid-js/web"

interface Point {
  x: number
  y: number
}

interface Path {
  points: Point[]
  color: string
  width: number
}

interface AppState {
  paths: Path[]
  currentPath: Point[]
  isDrawing: boolean
  color: string
  brushWidth: number
}

function DrawingApp() {
  const [store, setStore] = createStore<AppState>({
    paths: [],
    currentPath: [],
    isDrawing: false,
    color: "#000000",
    brushWidth: 3,
  })

  let svgRef: SVGSVGElement | undefined

  const getCoordinates = (e: MouseEvent | TouchEvent): Point => {
    if (!svgRef) return { x: 0, y: 0 }
    const rect = svgRef.getBoundingClientRect()

    if (e instanceof MouseEvent) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    } else {
      const touch = (e as TouchEvent).touches[0]
      if (!touch) return { x: 0, y: 0 }
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }
  }

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    const point = getCoordinates(e)
    console.log("startDrawing", point)
    setStore({
      isDrawing: true,
      currentPath: [point],
    })
  }

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!store.isDrawing) return
    e.preventDefault()
    const point = getCoordinates(e)
    setStore("currentPath", (prev) => [...prev, point])
  }

  const stopDrawing = () => {
    console.log("stopDrawing called", {
      isDrawing: store.isDrawing,
      currentPathLength: store.currentPath.length,
      pathsCount: store.paths.length,
    })
    if (store.isDrawing && store.currentPath.length > 0) {
      const newPath = {
        points: [...store.currentPath],
        color: store.color,
        width: store.brushWidth,
      }
      setStore("paths", (paths) => [...paths, newPath])
      console.log("Path added, new paths count:", store.paths.length + 1)
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
          background: "white",
          padding: "16px",
          "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          gap: "16px",
          "align-items": "center",
          "flex-wrap": "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
          <label style={{ "font-weight": "500" }}>
            Color:
          </label>
          <For each={colors}>
            {(c) => (
              <button
                onClick={() => setStore("color", c)}
                style={{
                  width: "32px",
                  height: "32px",
                  border: store.color === c
                    ? "3px solid #333"
                    : "2px solid #ccc",
                  background: c,
                  cursor: "pointer",
                  "border-radius": "4px",
                }}
                title={c}
              />
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
          <label style={{ "font-weight": "500" }}>
            Brush Size:
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={store.brushWidth}
            onInput={(e) =>
              setStore("brushWidth", parseInt(e.currentTarget.value))}
            style={{ width: "120px" }}
          />
          <span style={{ "min-width": "30px" }}>
            {store.brushWidth}px
          </span>
        </div>

        <button
          onClick={clearCanvas}
          style={{
            padding: "8px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            "border-radius": "4px",
            cursor: "pointer",
            "font-weight": "500",
          }}
        >
          Clear Canvas
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg
          ref={(el) => (svgRef = el)}
          width="100%"
          height="100%"
          style={{
            background: "white",
            cursor: "crosshair",
            "touch-action": "none",
          }}
          onMouseDown={(e) => startDrawing(e as any)}
          onMouseMove={(e) => draw(e as any)}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => startDrawing(e as any)}
          onTouchMove={(e) => draw(e as any)}
          onTouchEnd={stopDrawing}
        >
          {/* Render completed paths */}
          <For each={store.paths}>
            {(path) => (
              <path
                d={pointsToPath(path.points)}
                stroke={path.color}
                stroke-width={path.width}
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            )}
          </For>

          {/* Render current path being drawn */}
          {store.currentPath.length > 0 && (
            <path
              d={pointsToPath(store.currentPath)}
              stroke={store.color}
              stroke-width={store.brushWidth}
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          )}
        </svg>
      </div>
    </div>
  )
}

// Mount the app to #app
const appElement = document.getElementById("app")
if (appElement) {
  render(() => <DrawingApp />, appElement)
}

import { For } from "solid-js"
import { createStore } from "solid-js/store"
import Canvas from "./Canvas"
import type { AppState } from "./types"

export default function App() {
  const [store, setStore] = createStore<AppState>({
    paths: [],
    currentPath: [],
    isDrawing: false,
    activePointerId: null,
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
          onClick={() => setStore({ paths: [], currentPath: [] })}
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
      <Canvas store={store} setStore={setStore} />
    </div>
  )
}

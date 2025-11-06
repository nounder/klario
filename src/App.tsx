import { createStore } from "solid-js/store"
import Canvas from "./Canvas"
import CanvasToolbar from "./CanvasToolbar"
import type { AppState } from "./types"

export default function App() {
  const [store, setStore] = createStore<AppState>({
    nodes: [],
    currentTool: "StrokeTool",
    currentToolInstance: null,
    isDrawing: false,
    activePointerId: null,
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    isPanning: false,
    panStart: null,
  })

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <CanvasToolbar store={store} setStore={setStore} />
      <Canvas store={store} setStore={setStore} />
    </div>
  )
}

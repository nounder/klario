import { createStore } from "solid-js/store"
import Bangkok2025ArabicaSvg from "../assets/Bangkok2025Arabica.svg"
import Canvas from "./Canvas"
import CanvasToolbar from "./CanvasToolbar"
import { ImageNode } from "./nodes/index.ts"
import type { AppState } from "./types"

console.log(Bangkok2025ArabicaSvg)

export default function App() {
  const [store, setStore] = createStore<AppState>({
    nodes: [
      ImageNode.make({
        uri: Bangkok2025ArabicaSvg,
        bounds: {
          x: 0,
          y: 0,
          width: 300,
          height: 300,
        },
      }),
    ],
    currentTool: "StrokeTool",
    currentToolInstance: null,
    isDrawing: false,
    activePointerId: null,
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    isPanning: false,
    panStart: null,
    activeNodeId: null,
    pointerPosition: null,
    rootStyle: {},
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
      <CanvasToolbar
        store={store}
        setStore={setStore}
      />

      <Canvas
        store={store}
        setStore={setStore}
        bounds={{
          x: 0,
          y: 0,
          width: 300,
          height: 300,
        }}
      />
    </div>
  )
}

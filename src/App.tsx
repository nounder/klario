import { createSignal } from "solid-js"
import Bangkok2025ArabicaSvg from "../assets/Bangkok2025Arabica.svg"
import Canvas from "./Canvas"
import CanvasToolbar from "./CanvasToolbar"
import { ImageNode } from "./nodes/index.ts"
import * as Tools from "./tools/index.ts"
import type { ToolType } from "./tools/index.ts"
import type { Node } from "./nodes/index.ts"

console.log(Bangkok2025ArabicaSvg)

export default function App() {
  const [currentTool, setCurrentTool] = createSignal<ToolType>("StrokeTool")
  
  // Initial nodes to pass to Canvas
  const initialNodes: Node[] = [
    ImageNode.make({
      uri: Bangkok2025ArabicaSvg,
      bounds: {
        x: 0,
        y: 0,
        width: 300,
        height: 300,
      },
    }),
  ]

  // Canvas ref for clearing
  let canvasRef: any

  // Get the tool module based on current tool type
  const getTool = () => {
    return Tools[currentTool()]
  }

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
        currentTool={currentTool()}
        onToolChange={(type: ToolType) => setCurrentTool(type)}
        onClearCanvas={() => {
          // Reset Canvas by passing empty nodes
          // Since Canvas syncs on prop change, we can trigger a re-render
          window.location.reload() // Temporary - better solution would be to expose clearNodes from Canvas
        }}
      />

      <Canvas
        ref={canvasRef}
        nodes={initialNodes}
        tool={getTool()}
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

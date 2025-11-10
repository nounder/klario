import { createSignal } from "solid-js"
import Bangkok2025ArabicaSvg from "../assets/Bangkok2025Arabica.svg"
import Canvas, { type Node } from "./Canvas"
import CanvasToolbar from "./CanvasToolbar"
import { ImageNode } from "./nodes/index.ts"
import * as Tools from "./tools/index.ts"
import type { ToolType } from "./tools/index.ts"

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

  // Nodes state managed by App
  const [nodes, setNodes] = createSignal<Node[]>(initialNodes)

  // Get the tool module based on current tool type
  const getTool = () => Tools[currentTool()]

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
          // Reset Canvas by resetting nodes to initial state
          setNodes(initialNodes)
        }}
      />

      <Canvas
        nodes={nodes()}
        onChange={setNodes}
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

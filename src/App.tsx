import { createMemo, createSignal } from "solid-js"
import Bangkok2025ArabicaSvg from "../assets/Bangkok2025Arabica.svg"
import * as About from "./About.tsx"
import * as Canvas from "./Canvas.tsx"
import * as CanvasToolbar from "./CanvasToolbar.tsx"
import { ImageNode } from "./nodes/index.ts"
import * as Router from "./Router.tsx"
import * as Tools from "./tools/index.ts"
import type { ToolType } from "./tools/index.ts"

const tools: Array<{ type: ToolType; label: string }> = [
  { type: "MarkerStrokeTool", label: "Marker" },
  { type: "DrawEraserTool", label: "Draw Eraser" },
  { type: "NodeEraserTool", label: "Node Eraser" },
  { type: "ImageTool", label: "Image" },
  { type: "TextTool", label: "Text" },
]

const toolInstances = {
  MarkerStrokeTool: Tools.MarkerStrokeTool.make({
    epsilon: 0,
  }),
  DrawEraserTool: Tools.DrawEraserTool.make(),
  NodeEraserTool: Tools.NodeEraserTool.make(),
  ImageTool: Tools.ImageTool.make(),
  TextTool: Tools.TextTool.make(),
  GroupTool: Tools.GroupTool.make(),
}

function DrawingApp() {
  const [currentTool, setCurrentTool] = createSignal<ToolType>(
    "MarkerStrokeTool",
  )
  const toolInstance = createMemo(() => {
    return toolInstances[currentTool()]
  })

  // Initial nodes to pass to Canvas
  const initialNodes: Canvas.Node[] = [
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

  const [nodes, setNodes] = createSignal<Canvas.Node[]>(initialNodes)
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <CanvasToolbar.CanvasToolbar
        toolList={tools}
        tools={toolInstances}
        currentTool={currentTool()}
        onToolChange={(type: ToolType) => setCurrentTool(type)}
        onClearCanvas={() => {
          // Reset Canvas by resetting nodes to initial state
          setNodes(initialNodes)
        }}
      />

      <Canvas.Canvas
        nodes={nodes()}
        onChange={setNodes}
        tool={toolInstance()}
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

export default function App() {
  const routes: Router.Route[] = [
    {
      path: "/",
      render: () => <DrawingApp />,
    },
    {
      path: "/about",
      render: (route) => <About.About name={route.params.name} />,
    },
  ]

  return <Router.Router routes={routes} />
}

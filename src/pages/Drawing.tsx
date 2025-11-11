import { createMemo, createSignal } from "solid-js"
import Bangkok2025ArabicaSvg from "../../assets/Bangkok2025Arabica.svg"
import ZooBackgroundSvg from "../../assets/ZooBackground.svg"
import * as Canvas from "../Canvas.tsx"
import * as CanvasToolbar from "../CanvasToolbar.tsx"
import * as Tools from "../tools/index.ts"
import type { ToolType } from "../tools/index.ts"

const tools: Array<{ type: ToolType; label: string; icon: string }> = [
  { type: "MarkerStrokeTool", label: "Marker", icon: "✏️" },
  { type: "DrawEraserTool", label: "Draw Eraser", icon: "🧹" },
  { type: "NodeEraserTool", label: "Node Eraser", icon: "🗑️" },
  { type: "ImageTool", label: "Image", icon: "🖼️" },
  { type: "TextTool", label: "Text", icon: "📝" },
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

export function Drawing() {
  const [currentTool, setCurrentTool] = createSignal<ToolType>(
    "MarkerStrokeTool",
  )
  const toolInstance = createMemo(() => {
    return toolInstances[currentTool()]
  })

  // Initial nodes to pass to Canvas
  const initialNodes: Canvas.Node[] = []

  const [nodes, setNodes] = createSignal<Canvas.Node[]>(initialNodes)
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "row",
        height: "100vh",
        width: "100vw",
        position: "relative",
        padding: "40px",
        gap: "40px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%), url(${ZooBackgroundSvg}) repeat`,
          "background-size": "cover, 400px",
          "background-blend-mode": "overlay",
          opacity: 0.2,
          "z-index": -1,
        }}
      />
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

      <div
        style={{
          flex: "1",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "min-width": 0,
        }}
      >
        <div
          style={{
            background: "white",
            "border-radius": "24px",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <Canvas.Canvas
            nodes={nodes()}
            onChange={setNodes}
            tool={toolInstance()}
            bounds={{
              x: 0,
              y: 0,
              width: 1536,
              height: 1024,
            }}
            underlay={
              <image
                href={Bangkok2025ArabicaSvg}
                x={0}
                y={0}
                width={1536}
                height={1024}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}

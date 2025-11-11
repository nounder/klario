import { createMemo, createSignal } from "solid-js"
import Bangkok2025ArabicaSvg from "../../assets/Bangkok2025Arabica.svg"
import * as Canvas from "../Canvas.tsx"
import * as CanvasToolbar from "../CanvasToolbar.tsx"
import * as Router from "../Router.tsx"
import * as Tools from "../tools/index.ts"
import type { ToolType } from "../tools/index.ts"
import * as ViewTransitions from "../ViewTransitions.ts"

function BackButton() {
  const handleBackClick = () => {
    Router.navigateTransition("/")
  }

  return (
    <button
      onClick={handleBackClick}
      style={{
        background: "white",
        border: "none",
        "border-radius": "12px",
        width: "48px",
        height: "48px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        cursor: "pointer",
        "font-size": "24px",
        "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)"
      }}
    >
      ←
    </button>
  )
}

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

type DrawingPageProps = {
  id?: string
}

export function DrawingPage(props: DrawingPageProps) {
  const [currentTool, setCurrentTool] = createSignal<ToolType>(
    "MarkerStrokeTool",
  )
  const toolInstance = createMemo(() => {
    return toolInstances[currentTool()]
  })
  const canvasTransitionName = ViewTransitions.getDrawingTransitionName(
    props.id,
  )

  // Initial nodes to pass to Canvas
  const initialNodes: Canvas.Node[] = []

  const [nodes, setNodes] = createSignal<Canvas.Node[]>(initialNodes)

  // You can use props.id to load specific drawing data in the future
  return (
    <>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "16px",
          "align-items": "center",
          width: "100px",
        }}
      >
        <BackButton />
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
      </div>

      <div
        style={{
          flex: "1",
          display: "flex",
          "align-items": "center",
          "view-transition-name": canvasTransitionName,
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
    </>
  )
}

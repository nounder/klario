import { createSignal } from "solid-js"
import Bangkok2025ArabicaSvg from "../../assets/Bangkok2025Arabica.svg"
import PencilSvg from "../../assets/Pencil.svg"
import * as Canvas from "../Canvas.tsx"
import * as Router from "../Router.tsx"
import * as Tools from "../tools/index.ts"
import type { ToolType } from "../tools/index.ts"
import * as ViewTransitions from "../ViewTransitions.ts"

type Tool = "MarkerStrokeTool" | "DrawEraserTool"

function BackButton(props: { hasUnsavedChanges: boolean }) {
  const handleBackClick = () => {
    if (props.hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to go back?",
      )
      if (!confirmed) return
    }
    Router.navigateTransition("/")
  }

  return (
    <button
      onClick={handleBackClick}
      class="border-none cursor-pointer text-black text-6xl hover:scale-125 hover:rotate-10 transition-all stroke-3"
      style={{
        "-webkit-text-stroke": "3px #333",
        "-webkit-text-fill-color": "white",
      }}
      title="Back"
    >
      ×
    </button>
  )
}

function ToolButton(props: {
  type: ToolType
  label: string
  isActive: boolean
  onClick: () => void
  transform: string
}) {
  return (
    <button
      onClick={props.onClick}
      title={props.label}
      class="btn btn-circle border-none w-16 h-16 shadow-none hover:bg-transparent"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        "backdrop-filter": "blur(21px)",
        outline: props.isActive ? "3px solid #333" : "none",
        "outline-offset": "4px",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ background: "none" }}
      >
        <image
          href={PencilSvg}
          width="100%"
          height="100%"
          style={{
            transform: props.transform,
            "transform-origin": "center",
          }}
        />
      </svg>
    </button>
  )
}

function Toolbar(props: {
  currentTool: Tool
  onToolChange: (type: Tool) => void
  onClearCanvas?: () => void
  markerTool: any
}) {
  return (
    <div class="flex flex-col gap-4 items-center w-[100px] max-w-[100px] min-h-0">
      <div class="flex flex-col py-2 gap-4 items-center w-full shrink min-h-0 overflow-auto">
        <ToolButton
          type="DrawEraserTool"
          label="Draw Eraser"
          isActive={props.currentTool === "DrawEraserTool"}
          onClick={() => props.onToolChange("DrawEraserTool")}
          transform="rotate(-90deg) translateY(-110%) scale(3)"
        />
        <ToolButton
          type="MarkerStrokeTool"
          label="Marker"
          isActive={props.currentTool === "MarkerStrokeTool"}
          onClick={() => props.onToolChange("MarkerStrokeTool")}
          transform="rotate(90deg) translateY(110%) scale(3)"
        />
      </div>

      <div class="w-full flex flex-col gap-3 items-center shrink min-h-0 overflow-auto">
        {props.markerTool.renderSettings?.()}
      </div>
    </div>
  )
}

type DrawingPageProps = {
  id?: string
}

export function DrawingPage(props: DrawingPageProps) {
  const [currentTool, setCurrentTool] = createSignal<Tool>(
    "MarkerStrokeTool",
  )
  const canvasTransitionName = ViewTransitions.getDrawingTransitionName(
    props.id,
  )

  const [sharedWidth, setSharedWidth] = createSignal(21)

  const markerTool = Tools.MarkerStrokeTool.make({
    epsilon: 0,
    colors: [
      "#000000",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#FFA500",
      "#FFFFFF",
      "#800000",
      "#008000",
      "#000080",
      "#808000",
      "#800080",
      "#008080",
      "#FF6347",
      "#4B0082",
      "#FF1493",
      "#00CED1",
      "#FFD700",
      "#ADFF2F",
      "#FF69B4",
      "#8B4513",
      "#2F4F4F",
    ],
    width: sharedWidth,
    onWidthChange: setSharedWidth,
    onColorPicked: () => {
      // When color is picked and not on marker tool, switch to marker
      if (currentTool() !== "MarkerStrokeTool") {
        setCurrentTool("MarkerStrokeTool")
      }
    },
  })

  const eraserTool = Tools.DrawEraserTool.make({
    width: sharedWidth,
    onWidthChange: setSharedWidth,
  })

  const tool = () =>
    currentTool() === "MarkerStrokeTool" ? markerTool : eraserTool

  // Initial nodes to pass to Canvas
  const initialNodes: Canvas.Node[] = []

  const [nodes, setNodes] = createSignal<Canvas.Node[]>(initialNodes)

  const hasUnsavedChanges = () => nodes().length > 0

  return (
    <div class="flex relative w-full gap-2">
      <div class="flex flex-col sticky top-0 pt-4 gap-4 items-center w-[100px] self-start">
        <BackButton hasUnsavedChanges={hasUnsavedChanges()} />
        <Toolbar
          currentTool={currentTool()}
          onToolChange={(type: Tool) => setCurrentTool(type)}
          onClearCanvas={() => {
            // Reset Canvas by resetting nodes to initial state
            setNodes(initialNodes)
          }}
          markerTool={markerTool}
        />
      </div>

      <div
        class="flex-1 flex items-center"
        style={{
          "view-transition-name": canvasTransitionName,
        }}
      >
        <Canvas.Canvas
          nodes={nodes()}
          onChange={setNodes}
          tool={tool()}
          rootStyle={{
            background: "white",
          }}
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
  )
}

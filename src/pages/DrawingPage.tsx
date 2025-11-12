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

function ToolButton(props: {
  type: ToolType
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
  transform: string
}) {
  return (
    <button
      onClick={props.onClick}
      style={{}}
      title={props.label}
    >
      {props.icon === "pencil"
        ? (
          <svg
            width="48"
            height="48"
            viewBox="0 0 10 58"
            style={{
              background: "none",
            }}
          >
            <image
              href={PencilSvg}
              width="10"
              height="58"
              style={{
                transform: props.transform,
                "transform-origin": "center",
              }}
            />
          </svg>
        )
        : (
          props.icon
        )}
    </button>
  )
}

function ActionButton(props: {
  onClick: () => void
  children: any
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "16px",
        background: "rgba(239, 68, 68, 0.9)",
        "backdrop-filter": "blur(10px)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        "border-radius": "12px",
        cursor: "pointer",
        "font-size": "20px",
        "box-shadow":
          "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
        width: "56px",
        height: "56px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      }}
      title="Clear Canvas"
    >
      {props.children}
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
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        gap: "16px",
        "align-items": "center",
        width: "100px",
        "max-width": "100px",
        height: "100%",
        "min-height": 0,
      }}
    >
      {/* Tool buttons section - can shrink */}
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "10px",
          "align-items": "center",
          width: "100%",
          "flex-shrink": "1",
          "min-height": 0,
          overflow: "auto",
        }}
      >
        <ToolButton
          type="MarkerStrokeTool"
          label="Marker"
          icon="pencil"
          isActive={props.currentTool === "MarkerStrokeTool"}
          onClick={() => props.onToolChange("MarkerStrokeTool")}
          transform="rotate(90deg) translateY(100%) scale(3)"
        />
        <ToolButton
          type="DrawEraserTool"
          label="Draw Eraser"
          icon="pencil"
          isActive={props.currentTool === "DrawEraserTool"}
          onClick={() => props.onToolChange("DrawEraserTool")}
          transform="rotate(-90deg)"
        />
      </div>

      {/* Tool-specific settings section - can shrink */}
      <div
        style={{
          width: "100%",
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
          "align-items": "center",
          "flex-shrink": "1",
          "min-height": 0,
          overflow: "auto",
        }}
      >
        {props.markerTool.renderSettings?.()}
      </div>

      {/* Spacer - grows to push action buttons to bottom */}
      <div style={{ "flex-grow": "1" }} />

       {/* Action buttons section - always visible, never shrinks */}
      <div
        style={{
          width: "100%",
          "flex-shrink": "0",
          display: "flex",
          "flex-direction": "column",
          gap: "10px",
          "align-items": "center",
        }}
      >
        <ActionButton
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to clear the canvas? This cannot be undone.",
            )
            if (confirmed) {
              props.onClearCanvas?.()
            }
          }}
        >
          🗑️
        </ActionButton>
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
    onColorPicked: () => {
      // When color is picked and not on marker tool, switch to marker
      if (currentTool() !== "MarkerStrokeTool") {
        setCurrentTool("MarkerStrokeTool")
      }
    },
  })

  const eraserTool = Tools.DrawEraserTool.make()

  const tool = () =>
    currentTool() === "MarkerStrokeTool" ? markerTool : eraserTool

  // Initial nodes to pass to Canvas
  const initialNodes: Canvas.Node[] = []

  const [nodes, setNodes] = createSignal<Canvas.Node[]>(initialNodes)

  // Track if there are unsaved changes
  const hasUnsavedChanges = () => nodes().length > 0

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
          tool={tool()}
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

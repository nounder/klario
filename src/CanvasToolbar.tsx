import { createMemo, For } from "solid-js"
import * as Tools from "./tools/index.ts"
import type { ToolType } from "./tools/index.ts"

interface CanvasToolbarProps {
  currentTool: ToolType
  onToolChange: (type: ToolType) => void
  onClearCanvas?: () => void
}

function ToolSelector(props: {
  currentType: ToolType
  onToolChange: (type: ToolType) => void
}) {
  const tools: Array<{ type: ToolType; label: string }> = [
    { type: "StrokeTool", label: "Stroke" },
    { type: "DrawEraserTool", label: "Draw Eraser" },
    { type: "NodeEraserTool", label: "Node Eraser" },
    { type: "ImageTool", label: "Image" },
    { type: "TextTool", label: "Text" },
  ]

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <For each={tools}>
        {(tool) => (
          <button
            onClick={() => props.onToolChange(tool.type)}
            style={{
              padding: "8px 16px",
              background: props.currentType === tool.type
                ? "rgba(59, 130, 246, 0.9)"
                : "rgba(255, 255, 255, 0.5)",
              color: props.currentType === tool.type
                ? "white"
                : "rgba(0, 0, 0, 0.7)",
              border: props.currentType === tool.type
                ? "2px solid rgba(59, 130, 246, 1)"
                : "2px solid rgba(255, 255, 255, 0.3)",
              "border-radius": "10px",
              cursor: "pointer",
              "font-weight": "600",
              "font-size": "13px",
              "letter-spacing": "0.5px",
              "box-shadow": props.currentType === tool.type
                ? "0 4px 16px rgba(59, 130, 246, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
              transform: props.currentType === tool.type
                ? "scale(1.05)"
                : "scale(1)",
            }}
            title={tool.label}
          >
            {tool.label}
          </button>
        )}
      </For>
    </div>
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
        "box-shadow":
          "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow =
          "0 6px 20px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
      }}
    >
      {props.children}
    </button>
  )
}

export function CanvasToolbar(props: CanvasToolbarProps) {
  // Get the current tool instance for rendering settings
  const currentToolInstance = createMemo(() => {
    const tool = Tools[props.currentTool]
    return tool?.build()
  })

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        "backdrop-filter": "blur(20px) saturate(180%)",
        "-webkit-backdrop-filter": "blur(20px) saturate(180%)",
        padding: "20px 24px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        "border-radius": "0 0 20px 20px",
        "box-shadow":
          "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 16px rgba(0, 0, 0, 0.05)",
        display: "flex",
        gap: "20px",
        "align-items": "center",
        "flex-wrap": "wrap",
        position: "relative",
        "z-index": 10,
      }}
    >
      <ToolSelector
        currentType={props.currentTool}
        onToolChange={props.onToolChange}
      />

      {/* Render tool-specific settings */}
      {currentToolInstance()?.renderSettings?.()}

      <ActionButton
        onClick={() => {
          props.onClearCanvas?.()
        }}
      >
        Clear Canvas
      </ActionButton>
    </div>
  )
}

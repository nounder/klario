import { createMemo, For } from "solid-js"
import type { ToolType, ToolInstance } from "./tools/index.ts"

function ToolButton(props: {
  type: ToolType
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "8px 16px",
        background: props.isActive
          ? "rgba(59, 130, 246, 0.9)"
          : "rgba(255, 255, 255, 0.5)",
        color: props.isActive ? "white" : "rgba(0, 0, 0, 0.7)",
        border: props.isActive
          ? "2px solid rgba(59, 130, 246, 1)"
          : "2px solid rgba(255, 255, 255, 0.3)",
        "border-radius": "10px",
        cursor: "pointer",
        "font-weight": "600",
        "font-size": "13px",
        "letter-spacing": "0.5px",
        "box-shadow": props.isActive
          ? "0 4px 16px rgba(59, 130, 246, 0.3)"
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
        transform: props.isActive ? "scale(1.05)" : "scale(1)",
      }}
      title={props.label}
    >
      {props.label}
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

export function CanvasToolbar(props: {
  toolList: Array<{ type: ToolType; label: string }>
  tools: Record<ToolType, ToolInstance>
  currentTool: ToolType
  onToolChange: (type: ToolType) => void
  onClearCanvas?: () => void
}) {
  // Get the current tool instance for rendering settings
  const currentToolInstance = createMemo(() => {
    return props.tools[props.currentTool]
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
      <div style={{ display: "flex", gap: "8px" }}>
        <For each={props.toolList}>
          {(tool) => (
            <ToolButton
              type={tool.type}
              label={tool.label}
              isActive={props.currentTool === tool.type}
              onClick={() => props.onToolChange(tool.type)}
            />
          )}
        </For>
      </div>

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

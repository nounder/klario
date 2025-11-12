import { createMemo, For } from "solid-js"
import type { ToolInstance, ToolType } from "./tools/index.ts"

function ToolButton(props: {
  type: ToolType
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "16px",
        background: props.isActive
          ? "rgba(59, 130, 246, 0.9)"
          : "rgba(255, 255, 255, 0.8)",
        color: props.isActive ? "white" : "rgba(0, 0, 0, 0.7)",
        border: props.isActive
          ? "2px solid rgba(59, 130, 246, 1)"
          : "2px solid rgba(255, 255, 255, 0.3)",
        "border-radius": "12px",
        cursor: "pointer",
        "font-size": "24px",
        "box-shadow": props.isActive
          ? "0 4px 16px rgba(59, 130, 246, 0.3)"
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
        transform: props.isActive ? "scale(1.05)" : "scale(1)",
        width: "56px",
        height: "56px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      }}
      title={props.label}
    >
      {props.icon}
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

export function CanvasToolbar(props: {
  toolList: Array<{ type: ToolType; label: string; icon: string }>
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
        <For each={props.toolList}>
          {(tool) => (
            <ToolButton
              type={tool.type}
              label={tool.label}
              icon={tool.icon}
              isActive={props.currentTool === tool.type}
              onClick={() => props.onToolChange(tool.type)}
            />
          )}
        </For>
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
        {currentToolInstance()?.renderSettings?.()}
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
            props.onClearCanvas?.()
          }}
        >
          🗑️
        </ActionButton>
      </div>
    </div>
  )
}

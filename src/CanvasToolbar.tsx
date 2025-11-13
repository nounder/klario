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
      class="p-4 rounded-xl cursor-pointer text-2xl transition-all duration-200 ease-in-out w-14 h-14 flex items-center justify-center"
      classList={{
        "bg-blue-500/90 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/30 scale-105":
          props.isActive,
        "bg-white/80 text-black/70 border-2 border-white/30 shadow-md scale-100":
          !props.isActive,
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
      class="p-4 bg-red-500/90 backdrop-blur-md text-white border border-white/20 rounded-xl cursor-pointer text-xl shadow-lg transition-all duration-200 ease-in-out w-14 h-14 flex items-center justify-center"
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
    <div class="flex flex-col gap-4 items-center w-[100px] max-w-[100px] h-full min-h-0">
      {/* Tool buttons section - can shrink */}
      <div class="flex flex-col gap-2.5 items-center w-full shrink min-h-0 overflow-auto">
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
      <div class="w-full flex flex-col gap-3 items-center shrink min-h-0 overflow-auto">
        {currentToolInstance()?.renderSettings?.()}
      </div>

      {/* Spacer - grows to push action buttons to bottom */}
      <div class="grow" />

      {/* Action buttons section - always visible, never shrinks */}
      <div class="w-full shrink-0 flex flex-col gap-2.5 items-center">
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

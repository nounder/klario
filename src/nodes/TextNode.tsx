import { onMount } from "solid-js"
import type { Node as NodeType, TextNode } from "../types"

export const Type = "TextNode"

export function render(
  node: TextNode,
  ctx?: {
    activeNodeId: string | null
    onChange: (node: NodeType) => NodeType
  },
) {
  const isActive = ctx && node.id === ctx.activeNodeId

  if (isActive) {
    let divRef: HTMLDivElement | undefined

    onMount(() => {
      if (divRef) {
        setTimeout(() => {
          if (divRef) {
            divRef.focus()
          }
        }, 0)
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Shift+Enter for new lines
      // Enter alone does nothing - user manages when to deselect
    }

    const handleInput = (e: InputEvent) => {
      const target = e.target as HTMLDivElement
      const updatedNode = { ...node, content: target.textContent || "" }
      ctx.onChange(updatedNode)
    }

    return (
      <foreignObject
        x={node.bounds.x}
        y={node.bounds.y}
        width={400}
        height={300}
      >
        <div
          ref={divRef}
          contentEditable="plaintext-only"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          style={{
            "font-size": `${node.fontSize}px`,
            color: node.color,
            outline: "none",
            "white-space": "pre-wrap",
            "word-wrap": "break-word",
            "min-width": "20px",
            "min-height": `${node.fontSize}px`,
          }}
        >
          {node.content}
        </div>
      </foreignObject>
    )
  }

  // Not active - render as foreignObject without contenteditable
  return (
    <foreignObject
      x={node.bounds.x}
      y={node.bounds.y}
      width={400}
      height={300}
    >
      <div
        style={{
          "font-size": `${node.fontSize}px`,
          color: node.color,
          "white-space": "pre-wrap",
          "word-wrap": "break-word",
          "min-width": "20px",
          "min-height": `${node.fontSize}px`,
          "pointer-events": "none",
        }}
      >
        {node.content}
      </div>
    </foreignObject>
  )
}

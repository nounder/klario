import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onMount,
} from "solid-js"
import { createStore } from "solid-js/store"
import * as Nodes from "./nodes/index.ts"
import type { Node } from "./nodes/index.ts"
import type { ToolModule } from "./tools/index.ts"
import type { Bounds, CanvasState, StrokePoint } from "./types"
import { calculateBoundsFromPoints, mergeBounds } from "./utils.ts"

export {
  type Node,
}

type Point = { x: number; y: number }

export function Canvas(props: {
  nodes?: Node[]
  tool: ToolModule
  bounds?:
    | { width: number; height: number }
    | { x: number; y: number; width: number; height: number }
  rootStyle?: Record<string, string>
  onChange?: (nodes: Node[]) => void
  overlay?: JSX.Element
  underlay?: JSX.Element
}) {
  // Canvas-specific local state
  const [canvasState, setCanvasState] = createStore<CanvasState>({
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    isDrawing: false,
    activePointerId: null,
    isPanning: false,
    panStart: null,
    pointerPosition: null,
  })

  // Internal nodes state - only used when props.nodes is not provided
  const [internalNodes, setInternalNodes] = createSignal<Node[]>([])

  // Use props.nodes if provided, otherwise use internal state
  const nodes = () => props.nodes ?? internalNodes()
  const setNodes = (updater: Node[] | ((prev: Node[]) => Node[])) => {
    if (props.onChange) {
      // notify parent component of changes
      const newNodes = typeof updater === "function"
        ? updater(nodes())
        : updater
      props.onChange(newNodes)
    } else {
      // update internal state
      setInternalNodes(updater)
    }
  }

  // Canvas bounds as a signal for performance - updated incrementally
  const [internalCanvasBounds, setInternalCanvasBounds] = createSignal<
    Bounds | null
  >(null)

  // Internal state
  const [activeNodeId, setActiveNodeId] = createSignal<string | null>(null)

  // Tool instance from props
  const toolInstance = createMemo(() => props.tool)

  let svgRef: SVGSVGElement | undefined

  // Calculate initial bounds on mount
  onMount(() => {
    recalculateCanvasBounds()
  })

  // Recalculate canvas bounds from all nodes (used on delete or initial load)
  const recalculateCanvasBounds = () => {
    const allPoints: StrokePoint[] = []

    nodes().forEach((node) => {
      if ("stroke" in node) {
        allPoints.push(...node.stroke.points)
      }
    })

    if (allPoints.length === 0) {
      setInternalCanvasBounds(null)
      return
    }

    const padding = 50
    const xs = allPoints.map(p => p.x)
    const ys = allPoints.map(p => p.y)

    const minX = Math.min(...xs) - padding
    const minY = Math.min(...ys) - padding
    const maxX = Math.max(...xs) + padding
    const maxY = Math.max(...ys) + padding

    setInternalCanvasBounds({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    })
  }

  // Update canvas bounds incrementally when adding a node (performance optimization)
  const updateCanvasBoundsForNode = (node: Node) => {
    if (!("stroke" in node)) return

    const points = node.stroke.points
    if (points.length === 0) return

    const nodeBounds = calculateBoundsFromPoints(points, 50)
    const currentBounds = internalCanvasBounds()
    const newBounds = mergeBounds(currentBounds, nodeBounds)

    setInternalCanvasBounds(newBounds)
  }
  // Update viewBox when bounds prop changes or svgRef is set
  createEffect(() => {
    if (props.bounds) {
      setCanvasState("viewBox", {
        x: "x" in props.bounds ? props.bounds.x : 0,
        y: "y" in props.bounds ? props.bounds.y : 0,
        width: props.bounds.width,
        height: props.bounds.height,
      })
    } else if (svgRef) {
      const rect = svgRef.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setCanvasState("viewBox", {
          x: 0,
          y: 0,
          width: rect.width,
          height: rect.height,
        })
      }
    }
  })

  // Set up event listeners on mount
  onMount(() => {
    window.addEventListener("resize", updateViewBox)

    return () => {
      window.removeEventListener("resize", updateViewBox)
    }
  })

  // Get SVG coordinates for drawing (accounts for viewBox)
  const getCoordinates = (e: PointerEvent): StrokePoint => {
    if (!svgRef) return { x: 0, y: 0 }
    const rect = svgRef.getBoundingClientRect()

    const clientX = e.clientX
    const clientY = e.clientY

    // Calculate the actual viewport within the SVG element
    // accounting for preserveAspectRatio (default: xMidYMid meet)
    const viewBoxAspect = canvasState.viewBox.width / canvasState.viewBox.height
    const elementAspect = rect.width / rect.height

    let actualWidth = rect.width
    let actualHeight = rect.height
    let offsetX = 0
    let offsetY = 0

    if (elementAspect > viewBoxAspect) {
      // Element is wider - letterboxed on sides
      actualWidth = rect.height * viewBoxAspect
      offsetX = (rect.width - actualWidth) / 2
    } else if (elementAspect < viewBoxAspect) {
      // Element is taller - letterboxed on top/bottom
      actualHeight = rect.width / viewBoxAspect
      offsetY = (rect.height - actualHeight) / 2
    }

    // Convert screen coordinates to SVG viewBox coordinates
    const relativeX = (clientX - rect.left - offsetX) / actualWidth
    const relativeY = (clientY - rect.top - offsetY) / actualHeight

    const point: StrokePoint = {
      x: canvasState.viewBox.x + relativeX * canvasState.viewBox.width,
      y: canvasState.viewBox.y + relativeY * canvasState.viewBox.height,
    }

    // Add pressure if available
    if (e.pressure > 0) {
      point.pressure = e.pressure
    }

    // Add stylus-specific properties if available
    if (e.pointerType === "pen") {
      point.tiltX = e.tiltX || 0
      point.tiltY = e.tiltY || 0
      point.twist = e.twist || 0
    }

    return point
  }

  const startDrawing = (e: PointerEvent) => {
    // If we're already drawing with a different pointer, ignore this one
    if (
      canvasState.isDrawing
      && canvasState.activePointerId !== null
      && canvasState.activePointerId !== e.pointerId
    ) {
      console.log(
        `Ignoring pointer ${e.pointerId} (${e.pointerType}), already drawing with ${canvasState.activePointerId}`,
      )
      return
    }

    const instance = toolInstance()
    if (!instance) return

    e.preventDefault()
    e.stopPropagation()

    console.log(
      `Starting drawing with pointer ${e.pointerId} (${e.pointerType})`,
    )

    // Set state BEFORE capturing pointer
    setCanvasState({
      isDrawing: true,
      activePointerId: e.pointerId,
    })

    // Capture the pointer to receive all events for this pointer
    const target = e.target as Element
    try {
      target.setPointerCapture(e.pointerId)
    } catch (err) {
      console.error("Failed to capture pointer:", err)
    }

    const point = getCoordinates(e)
    const tool = props.tool

    // Call the tool's onPointerDown handler with appropriate helpers
    if (tool && "onPointerDown" in tool) {
      ;(tool as any).onPointerDown({
        point,
        addNode: (node: Node) => {
          setNodes(prev => [...prev, node])
          updateCanvasBoundsForNode(node)
        },
        deleteNodes: (nodeIds: string[]) => {
          setNodes(prev => prev.filter(n => !nodeIds.includes(n.id)))
        },
        nodes: nodes(),
      })
    }
  }

  const draw = (e: PointerEvent) => {
    // Update pointer position in canvas state
    const point = getCoordinates(e)
    setCanvasState("pointerPosition", { x: point.x, y: point.y })

    // Only process drawing if we're actively drawing with this pointer
    if (!canvasState.isDrawing || canvasState.activePointerId !== e.pointerId) {
      return
    }

    const instance = toolInstance()
    if (!instance) return

    e.preventDefault()
    const tool = props.tool

    // Call the tool's onPointerMove handler if it exists
    if (tool && "onPointerMove" in tool) {
      ;(tool as any).onPointerMove({
        point,
        addNode: (node: Node) => {
          setNodes(prev => [...prev, node])
          updateCanvasBoundsForNode(node)
        },
        deleteNodes: (nodeIds: string[]) => {
          setNodes(prev => prev.filter(n => !nodeIds.includes(n.id)))
        },
        nodes: nodes(),
      })
    }
  }

  const handlePointerEnter = (_e: PointerEvent) => {
    const instance = toolInstance()
    if (!instance) return

    const tool = props.tool
    ;(tool as any)?.onPointerEnter?.({
      setAppStore: (_updates: any) => {
        // Canvas state updates would go here if needed
      },
    })
  }

  const handlePointerLeave = (e: PointerEvent) => {
    // Clear pointer position when leaving canvas
    setCanvasState("pointerPosition", null)

    // Call the tool's onPointerLeave handler if it exists
    const instance = toolInstance()
    if (instance) {
      const tool = props.tool
      ;(tool as any)?.onPointerLeave?.({
        setAppStore: (_updates: any) => {
          // Canvas state updates would go here if needed
        },
      })
    }

    stopDrawing(e)
  }

  const stopDrawing = (e?: PointerEvent) => {
    if (
      e
      && canvasState.activePointerId !== null
      && canvasState.activePointerId !== e.pointerId
    ) {
      console.log(
        `Ignoring pointerup ${e.pointerId} (${e.pointerType}), active pointer is ${canvasState.activePointerId}`,
      )
      return
    }

    console.log(
      `Stopping drawing with pointer ${e?.pointerId} (${e?.pointerType})`,
    )

    const instance = toolInstance()
    if (canvasState.isDrawing && instance) {
      const tool = props.tool

      // Call the tool's onPointerUp handler if it exists
      if (tool && "onPointerUp" in tool) {
        const point = e ? getCoordinates(e) : { x: 0, y: 0 }
        ;(tool as any).onPointerUp({
          point,
          addNode: (node: Node) => {
            setNodes(prev => [...prev, node])
            updateCanvasBoundsForNode(node)
          },
          deleteNodes: (nodeIds: string[]) => {
            setNodes(prev => prev.filter(node => !nodeIds.includes(node.id)))
            // Recalculate bounds after deletion
            recalculateCanvasBounds()
          },
          nodes: nodes(),
        })
      }
    }

    // Always reset state and release pointer
    setCanvasState({
      isDrawing: false,
      activePointerId: null,
    })

    // Release pointer capture
    if (e) {
      try {
        const target = e.target as Element
        target.releasePointerCapture(e.pointerId)
        console.log(`Released pointer capture for ${e.pointerId}`)
      } catch (err) {
        console.error("Failed to release pointer capture:", err)
      }
    }
  }

  const cancelDrawing = (e: PointerEvent) => {
    console.log(
      `Canceling drawing with pointer ${e.pointerId} (${e.pointerType})`,
    )

    const instance = toolInstance()
    if (canvasState.activePointerId === e.pointerId && instance) {
      const tool = props.tool

      // Call the tool's onPointerCancel handler if it exists
      if (tool && "onPointerCancel" in tool) {
        ;(tool as any).onPointerCancel({
          setState: (instance as any).setState,
          setAppStore: (_updates: any) => {
            // State will be reset below
          },
        })
      }
    }

    // Always reset state and release pointer on cancel
    setCanvasState({
      isDrawing: false,
      activePointerId: null,
    })

    // Release pointer capture
    try {
      const target = e.target as Element
      target.releasePointerCapture(e.pointerId)
      console.log(`Released pointer capture for ${e.pointerId} on cancel`)
    } catch (err) {
      console.error("Failed to release pointer capture on cancel:", err)
    }
  }

  // Calculate bounds for a stroke
  const calculateBounds = (
    points: StrokePoint[],
    width: number = 10,
  ): Bounds => {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    const padding = width * 2 + 10

    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)

    const minX = Math.min(...xs) - padding
    const minY = Math.min(...ys) - padding
    const maxX = Math.max(...xs) + padding
    const maxY = Math.max(...ys) + padding

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  // Handle node changes
  const handleNodeChange = (updatedNode: Node): Node => {
    const nodeIndex = nodes().findIndex((n) => n.id === updatedNode.id)
    if (nodeIndex !== -1) {
      setNodes(prev => {
        const newNodes = [...prev]
        newNodes[nodeIndex] = updatedNode
        return newNodes
      })
    }
    return updatedNode
  }



  // Update viewBox based on current SVG size
  const updateViewBox = () => {
    if (!svgRef) return
    // Don't auto-update if bounds prop is provided
    if (props.bounds) return

    const rect = svgRef.getBoundingClientRect()
    setCanvasState("viewBox", (vb) => ({
      ...vb,
      width: rect.width,
      height: rect.height,
    }))
  }

  return (
    <div class="w-full">
       <svg
         ref={svgRef}
         viewBox={`${canvasState.viewBox.x} ${canvasState.viewBox.y} ${canvasState.viewBox.width} ${canvasState.viewBox.height}`}
         preserveAspectRatio="xMidYMid meet"
         style={{
           contain: "layout paint",
           cursor: "crosshair",
           ...props.rootStyle,
         }}
        onPointerEnter={(e) => handlePointerEnter(e)}
        onPointerDown={(e) => startDrawing(e)}
        onPointerMove={(e) => draw(e)}
        onPointerUp={(e) => stopDrawing(e)}
        onPointerLeave={(e) => handlePointerLeave(e)}
        onPointerCancel={(e) => cancelDrawing(e)}
        onClick={(e) => {
          // Deselect when clicking canvas background
          if (e.target === e.currentTarget) {
            setActiveNodeId(null)
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {props.overlay}

        {/* Render completed nodes */}
        <For each={nodes()}>
          {(node) => {
            const ctx = {
              activeNodeId: activeNodeId(),
              onChange: handleNodeChange,
            }
            const renderer = Nodes[node.type]
            return renderer?.render(node as never, ctx)
          }}
        </For>

        {/* Render tool-specific canvas overlays (optional renderCanvas method) */}
        {(toolInstance() as any)?.renderCanvas?.({
          pointerPosition: canvasState.pointerPosition,
        })}

        {props.underlay}
      </svg>
    </div>
  )
}

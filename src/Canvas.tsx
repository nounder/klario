import { createEffect, createMemo, For, onMount } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"
import * as Nodes from "./nodes/index.ts"
import type { Node } from "./nodes/index.ts"
import { simplifyStroke } from "./strokes/simplification.ts"
import * as Tools from "./tools/index.ts"
import type { AppState, Bounds, StrokePoint } from "./types"

type Point = { x: number; y: number }

export default function Canvas(props: {
  store: AppState
  setStore: SetStoreFunction<AppState>
  bounds?:
    | { width: number; height: number }
    | { x: number; y: number; width: number; height: number }
}) {
  const store = props.store
  const setStore = props.setStore

  let svgRef: SVGSVGElement | undefined

  // Update viewBox when bounds prop changes or svgRef is set
  createEffect(() => {
    if (props.bounds) {
      setStore("viewBox", {
        x: "x" in props.bounds ? props.bounds.x : 0,
        y: "y" in props.bounds ? props.bounds.y : 0,
        width: props.bounds.width,
        height: props.bounds.height,
      })
    } else if (svgRef) {
      const rect = svgRef.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setStore("viewBox", {
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
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("resize", updateViewBox)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("resize", updateViewBox)
    }
  })

  // Get screen/client coordinates for panning
  const getScreenCoordinates = (e: PointerEvent): Point => {
    return { x: e.clientX, y: e.clientY }
  }

  // Get SVG coordinates for drawing (accounts for viewBox)
  const getCoordinates = (e: PointerEvent): StrokePoint => {
    if (!svgRef) return { x: 0, y: 0 }
    const rect = svgRef.getBoundingClientRect()

    const clientX = e.clientX
    const clientY = e.clientY

    // Convert screen coordinates to SVG viewBox coordinates
    const relativeX = (clientX - rect.left) / rect.width
    const relativeY = (clientY - rect.top) / rect.height

    const point: StrokePoint = {
      x: store.viewBox.x + relativeX * store.viewBox.width,
      y: store.viewBox.y + relativeY * store.viewBox.height,
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

  const handlePointerDown = (event: PointerEvent) => {
    const target = event.target as Element
    target.setPointerCapture(event.pointerId)
    event.preventDefault()
    event.stopPropagation()
  }

  const releasePointer = (event: PointerEvent) => {
    try {
      const target = event.target as Element
      target.releasePointerCapture(event.pointerId)
    } catch (e) {
      // Ignore errors if pointer was already released
    }
  }

  const startDrawing = (e: PointerEvent) => {
    if (
      store.isDrawing
      && store.activePointerId !== null
      && store.activePointerId !== e.pointerId
    ) {
      return
    }

    handlePointerDown(e)

    if (store.isPanning) {
      startPanning(e)
      return
    }

    if (!store.currentToolInstance) return

    const point = getCoordinates(e)
    const tool = Tools[store.currentTool]

    // Call the tool's onPointerDown handler with appropriate helpers
    if (tool && "onPointerDown" in tool) {
      tool?.onPointerDown({
        point,
        state: store.currentToolInstance.state,
        setState: store.currentToolInstance.setState,
        setAppStore: (updates: any) => {
          setStore({
            ...updates,
            activePointerId: e.pointerId,
          })
        },
        addNode: (node: Node) => {
          setStore("nodes", (nodes) => [...nodes, node])
        },
        nodes: store.nodes,
      })
    }
  }

  const draw = (e: PointerEvent) => {
    if (store.isPanning) {
      pan(e)
      return
    }

    // Update pointer position in app state
    if (!store.isPanning) {
      const point = getCoordinates(e)
      setStore("pointerPosition", { x: point.x, y: point.y })
    }

    if (!store.isDrawing || store.activePointerId !== e.pointerId) return
    if (!store.currentToolInstance) return

    e.preventDefault()
    const point = getCoordinates(e)
    const tool = Tools[store.currentTool]

    // Call the tool's onPointerMove handler if it exists
    if (tool && "onPointerMove" in tool) {
      tool.onPointerMove({
        point,
        state: store.currentToolInstance.state,
        setState: store.currentToolInstance.setState,
        setAppStore: (updates: any) => {
          setStore(updates)
        },
        nodes: store.nodes,
      } as any)
    }
  }

  const handlePointerEnter = (e: PointerEvent) => {
    if (!store.currentToolInstance) return

    const tool = Tools[store.currentTool]

    // Call the tool's onPointerEnter handler if it exists
    tool?.onPointerEnter?.({
      setAppStore: (updates: any) => {
        setStore(updates)
      },
    })
  }

  const handlePointerLeave = (e: PointerEvent) => {
    // Clear pointer position when leaving canvas
    setStore("pointerPosition", null)

    // Call the tool's onPointerLeave handler if it exists
    if (store.currentToolInstance) {
      const tool = Tools[store.currentTool]

      if (tool && "onPointerMove" in tool) {
        tool?.onPointerLeave({
          setAppStore: (updates: any) => {
            setStore(updates)
          },
        } as any)
      }
    }

    stopDrawing(e)
  }

  const stopDrawing = (e?: PointerEvent) => {
    if (store.isPanning && store.panStart) {
      stopPanning()
      return
    }

    if (
      e
      && store.activePointerId !== null
      && store.activePointerId !== e.pointerId
    ) {
      return
    }

    if (store.isDrawing && store.currentToolInstance) {
      const tool = Tools[store.currentTool]

      // Call the tool's onPointerUp handler if it exists
      if (tool && "onPointerUp" in tool) {
        const point = e ? getCoordinates(e) : { x: 0, y: 0 }
        tool.onPointerUp({
          point,
          state: store.currentToolInstance.state,
          setState: store.currentToolInstance.setState,
          setAppStore: (updates: any) => {
            if (typeof updates === "function") {
              // Handle function updates
              const newState = updates(store)
              setStore({
                ...newState,
                activePointerId: null,
              })
            } else {
              // Handle object updates
              setStore({
                ...updates,
                activePointerId: null,
              })
            }
          },
          addNode: (node: Node) => {
            setStore("nodes", (nodes) => [...nodes, node])
          },
          deleteNodes: (nodeIds: string[]) => {
            setStore(
              "nodes",
              (nodes) => nodes.filter(node => !nodeIds.includes(node.id)),
            )
          },
          calculateBounds,
          simplifyStroke,
        })
      } else {
        setStore("isDrawing", false)
        setStore("activePointerId", null)
      }
    } else {
      setStore("isDrawing", false)
      setStore("activePointerId", null)
    }

    if (e) {
      releasePointer(e)
    }
  }

  const cancelDrawing = (e: PointerEvent) => {
    if (store.activePointerId === e.pointerId && store.currentToolInstance) {
      const tool = Tools[store.currentTool]

      // Call the tool's onPointerCancel handler if it exists
      if (tool && "onPointerCancel" in tool) {
        tool.onPointerCancel({
          setState: store.currentToolInstance.setState,
          setAppStore: (updates: any) => {
            setStore({
              ...updates,
              activePointerId: null,
            })
          },
        })
      } else {
        setStore("isDrawing", false)
        setStore("activePointerId", null)
      }

      releasePointer(e)
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
    const nodeIndex = store.nodes.findIndex((n) => n.id === updatedNode.id)
    if (nodeIndex !== -1) {
      setStore("nodes", nodeIndex, updatedNode)
    }
    return updatedNode
  }

  // Calculate the bounding box of all nodes
  const canvasBounds = createMemo((): Bounds | null => {
    const allPoints: StrokePoint[] = []

    store.nodes.forEach((node) => {
      if (node.type === "StrokeNode") {
        allPoints.push(...node.stroke.points)
      }
    })

    if (
      store.currentTool === "StrokeTool"
      && store.currentToolInstance
      && store.currentToolInstance.state
      && store.currentToolInstance.state.currentPath
      && store.currentToolInstance.state.currentPath.length > 0
    ) {
      allPoints.push(...store.currentToolInstance.state.currentPath)
    }

    if (allPoints.length === 0) return null

    const padding = 50
    const xs = allPoints.map(p => p.x)
    const ys = allPoints.map(p => p.y)

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
  })

  // Check if panning should be enabled
  const canPan = createMemo((): boolean => {
    const bounds = canvasBounds()
    if (!bounds) return false

    return (
      bounds.width > store.viewBox.width || bounds.height > store.viewBox.height
    )
  })

  // Update viewBox based on current SVG size
  const updateViewBox = () => {
    if (!svgRef) return
    // Don't auto-update if bounds prop is provided
    if (props.bounds) return
    
    const rect = svgRef.getBoundingClientRect()
    setStore("viewBox", (vb) => ({
      ...vb,
      width: rect.width,
      height: rect.height,
    }))
  }

  // Panning functions
  const startPanning = (e: PointerEvent) => {
    if (!canPan()) return
    e.preventDefault()
    const point = getScreenCoordinates(e)
    setStore("panStart", point)
  }

  const pan = (e: PointerEvent) => {
    if (!store.isPanning || !store.panStart || !svgRef) return
    e.preventDefault()

    const point = getScreenCoordinates(e)
    const rect = svgRef.getBoundingClientRect()

    const screenDx = point.x - store.panStart.x
    const screenDy = point.y - store.panStart.y
    const viewBoxDx = (screenDx / rect.width) * store.viewBox.width
    const viewBoxDy = (screenDy / rect.height) * store.viewBox.height

    setStore("viewBox", (vb) => {
      const bounds = canvasBounds()

      let newX = vb.x - viewBoxDx
      let newY = vb.y - viewBoxDy

      if (bounds && canPan()) {
        if (bounds.width > vb.width) {
          newX = Math.max(
            bounds.x,
            Math.min(bounds.x + bounds.width - vb.width, newX),
          )
        } else {
          newX = vb.x
        }

        if (bounds.height > vb.height) {
          newY = Math.max(
            bounds.y,
            Math.min(bounds.y + bounds.height - vb.height, newY),
          )
        } else {
          newY = vb.y
        }
      }

      return {
        ...vb,
        x: newX,
        y: newY,
      }
    })

    setStore("panStart", point)
  }

  const stopPanning = () => {
    setStore("panStart", null)
  }

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !store.isPanning) {
      e.preventDefault()
      setStore("isPanning", true)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault()
      setStore("isPanning", false)
      setStore("panStart", null)
    }
  }



  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${store.viewBox.x} ${store.viewBox.y} ${store.viewBox.width} ${store.viewBox.height}`}
        classList={{
          panning: store.isPanning && store.panStart !== null,
          drawing: !store.isPanning,
        }}
        style={{
          cursor: store.isPanning && store.panStart === null
            ? "grab"
            : undefined,
          ...store.rootStyle,
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
            setStore("activeNodeId", null)
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Render completed nodes */}
        <For each={store.nodes}>
          {(node) => {
            const ctx = {
              activeNodeId: store.activeNodeId,
              onChange: handleNodeChange,
            }
            const renderer = Nodes[node.type]
            return renderer?.render(node as never, ctx)
          }}
        </For>

        {/* Render tool-specific canvas overlays (optional renderCanvas method) */}
        {store.currentToolInstance?.renderCanvas?.({
          pointerPosition: store.pointerPosition,
        })}
      </svg>
    </div>
  )
}

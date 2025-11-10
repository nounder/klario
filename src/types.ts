import type { Node } from "./nodes/index.ts"
import type { ToolType } from "./tools/index.ts"

// Base types
export type Point = {
  x: number
  y: number
}

export type StrokePoint = {
  x: number
  y: number
  pressure?: number
  // Optional stylus data
  tiltX?: number
  tiltY?: number
  twist?: number
}

export type ToolCanvasProps = {
  pointerPosition: Point | null
}

export type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

// Stroke types (discriminated union)
export type PenStroke = {
  type: "PenStroke"
  points: StrokePoint[]
  color: string
  width: number
  bounds: Bounds
}

export type MarkerStroke = {
  type: "MarkerStroke"
  points: StrokePoint[]
  color: string
  width: number
  bounds: Bounds
}

export type Stroke =
  | PenStroke
  | MarkerStroke

export type ViewBox = {
  x: number
  y: number
  width: number
  height: number
}

export type StrokeType =
  | "PenStroke"
  | "MarkerStroke"

// Application state (shared across components)
export type AppState = {
  nodes: Node[]
  currentTool: ToolType
  currentToolInstance: any | null
  activeNodeId: string | null
  rootStyle: Record<string, string>
}

// Canvas-specific state (local to Canvas component)
export type CanvasState = {
  viewBox: ViewBox
  isDrawing: boolean
  activePointerId: number | null
  isPanning: boolean
  panStart: { x: number; y: number } | null
  pointerPosition: Point | null
}

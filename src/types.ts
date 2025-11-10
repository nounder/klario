import type { Node } from "./nodes/index.ts"
import type { ToolType } from "./tools/index.ts"

// Base types
export interface Point {
  x: number
  y: number
}

export interface StrokePoint {
  x: number
  y: number
  pressure?: number
  // Optional stylus data
  tiltX?: number
  tiltY?: number
  twist?: number
}

export interface ToolCanvasProps {
  pointerPosition: Point | null
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

// Stroke types (discriminated union)
export interface PenStroke {
  type: "PenStroke"
  points: StrokePoint[]
  color: string
  width: number
  bounds: Bounds
}

export interface MarkerStroke {
  type: "MarkerStroke"
  points: StrokePoint[]
  color: string
  width: number
  bounds: Bounds
}

export type Stroke =
  | PenStroke
  | MarkerStroke

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

export type StrokeType =
  | "PenStroke"
  | "MarkerStroke"

// Application state
export interface AppState {
  nodes: Node[]
  currentTool: ToolType
  currentToolInstance: any | null
  isDrawing: boolean
  activePointerId: number | null
  viewBox: ViewBox
  isPanning: boolean
  panStart: { x: number; y: number } | null
  activeNodeId: string | null
  pointerPosition: Point | null
  rootStyle: Record<string, string>
}

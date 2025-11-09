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

// Node types
export interface NodeBase {
  id: string
  type: NodeType
  parent: Node | null
  bounds: Bounds
  locked: boolean
}

export interface StrokeNode extends NodeBase {
  type: "StrokeNode"
  stroke: Omit<Stroke, "bounds">
}

export interface ImageNode extends NodeBase {
  type: "ImageNode"
  uri: string
}

export interface GroupNode extends NodeBase {
  type: "GroupNode"
  children: Node[]
}

export interface TextNode extends NodeBase {
  type: "TextNode"
  content: string
  fontSize: number
  color: string
}

export interface DrawEraserNode extends NodeBase {
  type: "DrawEraserNode"
  points: StrokePoint[]
  width: number
}

export type Node =
  | StrokeNode
  | ImageNode
  | GroupNode
  | TextNode
  | DrawEraserNode

export type NodeType =
  | "StrokeNode"
  | "ImageNode"
  | "GroupNode"
  | "TextNode"
  | "DrawEraserNode"

// Tool types
export interface StrokeToolState {
  strokeType: StrokeType
  color: string
  width: number
  currentPath: StrokePoint[]
}

export interface ImageToolState {
  uri: string
  width: number
  height: number
}

export interface TextToolState {
  fontSize: number
  color: string
}

export interface GroupToolState {
  selectedNodes: Node[]
}

export interface NodeEraserToolState {
  width: number
  currentPath: StrokePoint[]
  intersectedNodeIds: Set<string>
}

export interface DrawEraserToolState {
  width: number
  currentPath: StrokePoint[]
}

export interface StrokeTool {
  type: "StrokeTool"
  state: StrokeToolState
}

export interface ImageTool {
  type: "ImageTool"
  state: ImageToolState
}

export interface TextTool {
  type: "TextTool"
  state: TextToolState
}

export interface GroupTool {
  type: "GroupTool"
  state: GroupToolState
}

export interface NodeEraserTool {
  type: "NodeEraserTool"
  state: NodeEraserToolState
}

export interface DrawEraserTool {
  type: "DrawEraserTool"
  state: DrawEraserToolState
}

export type Tool =
  | StrokeTool
  | ImageTool
  | TextTool
  | GroupTool
  | NodeEraserTool
  | DrawEraserTool

export type ToolType =
  | "StrokeTool"
  | "ImageTool"
  | "TextTool"
  | "GroupTool"
  | "NodeEraserTool"
  | "DrawEraserTool"

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

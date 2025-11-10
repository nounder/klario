import type { Bounds, Stroke, StrokePoint } from "../types"

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

export * as DrawEraserNode from "./DrawEraserNode.tsx"
export * as GroupNode from "./GroupNode.tsx"
export * as ImageNode from "./ImageNode.tsx"
export * as StrokeNode from "./StrokeNode.tsx"
export * as TextNode from "./TextNode.tsx"

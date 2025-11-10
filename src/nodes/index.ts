import type { Bounds, Stroke, StrokePoint } from "../types"

export type NodeBase = {
  id: string
  type: NodeType
  parent: Node | null
  bounds: Bounds
  locked: boolean
}

export type StrokeNode = NodeBase & {
  type: "StrokeNode"
  stroke: Omit<Stroke, "bounds">
}

export type ImageNode = NodeBase & {
  type: "ImageNode"
  uri: string
}

export type GroupNode = NodeBase & {
  type: "GroupNode"
  children: Node[]
}

export type TextNode = NodeBase & {
  type: "TextNode"
  content: string
  fontSize: number
  color: string
}

export type DrawEraserNode = NodeBase & {
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

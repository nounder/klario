export * as DrawEraserTool from "./DrawEraserTool.tsx"
export * as GroupTool from "./GroupTool.tsx"
export * as ImageTool from "./ImageTool.tsx"
export * as NodeEraserTool from "./NodeEraserTool.tsx"
export * as StrokeTool from "./StrokeTool.tsx"
export * as TextTool from "./TextTool.tsx"

import type { StrokeTool } from "./StrokeTool.tsx"
import type { ImageTool } from "./ImageTool.tsx"
import type { TextTool } from "./TextTool.tsx"
import type { GroupTool } from "./GroupTool.tsx"
import type { NodeEraserTool } from "./NodeEraserTool.tsx"
import type { DrawEraserTool } from "./DrawEraserTool.tsx"

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

export * as DrawEraserTool from "./DrawEraserTool.tsx"
export * as GroupTool from "./GroupTool.tsx"
export * as ImageTool from "./ImageTool.tsx"
export * as MarkerStrokeTool from "./MarkerStrokeTool.tsx"
export * as NodeEraserTool from "./NodeEraserTool.tsx"
export * as TextTool from "./TextTool.tsx"

import type { ToolInstance } from "./Tool.ts"

// Export ToolInstance for use in other files
export type { ToolInstance } from "./Tool.ts"

// Tool type names
export type ToolType =
  | "MarkerStrokeTool"
  | "ImageTool"
  | "TextTool"
  | "GroupTool"
  | "NodeEraserTool"
  | "DrawEraserTool"

// Tool module type - now just ToolInstance
export type ToolModule = ToolInstance

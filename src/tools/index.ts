export {
  DrawEraserTool,
} from "./DrawEraserTool.tsx"
export {
  GroupTool,
} from "./GroupTool.tsx"
export {
  ImageTool,
} from "./ImageTool.tsx"
export {
  NodeEraserTool,
} from "./NodeEraserTool.tsx"
export {
  StrokeTool,
} from "./StrokeTool.tsx"
export {
  TextTool,
} from "./TextTool.tsx"

import type { ToolInstance } from "./Tool.ts"

// Tool type names
export type ToolType =
  | "StrokeTool"
  | "ImageTool"
  | "TextTool"
  | "GroupTool"
  | "NodeEraserTool"
  | "DrawEraserTool"

// Tool module type - now just ToolInstance
export type ToolModule = ToolInstance

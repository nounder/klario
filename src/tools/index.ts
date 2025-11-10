export * as DrawEraserTool from "./DrawEraserTool.tsx"
export * as GroupTool from "./GroupTool.tsx"
export * as ImageTool from "./ImageTool.tsx"
export * as NodeEraserTool from "./NodeEraserTool.tsx"
export * as StrokeTool from "./StrokeTool.tsx"
export * as TextTool from "./TextTool.tsx"

import type * as DrawEraserToolModule from "./DrawEraserTool.tsx"
import type * as GroupToolModule from "./GroupTool.tsx"
import type * as ImageToolModule from "./ImageTool.tsx"
import type * as NodeEraserToolModule from "./NodeEraserTool.tsx"
import type * as StrokeToolModule from "./StrokeTool.tsx"
import type * as TextToolModule from "./TextTool.tsx"

import type { StrokeTool } from "./StrokeTool.tsx"
import type { ImageTool } from "./ImageTool.tsx"
import type { TextTool } from "./TextTool.tsx"
import type { GroupTool } from "./GroupTool.tsx"
import type { NodeEraserTool } from "./NodeEraserTool.tsx"
import type { DrawEraserTool } from "./DrawEraserTool.tsx"

// Tool instance types (what build() returns)
export type Tool =
  | StrokeTool
  | ImageTool
  | TextTool
  | GroupTool
  | NodeEraserTool
  | DrawEraserTool

// Tool type names
export type ToolType =
  | "StrokeTool"
  | "ImageTool"
  | "TextTool"
  | "GroupTool"
  | "NodeEraserTool"
  | "DrawEraserTool"

// Tool module types (the full module with build(), onPointerDown, etc.)
export type ToolModule =
  | typeof DrawEraserToolModule
  | typeof GroupToolModule
  | typeof ImageToolModule
  | typeof NodeEraserToolModule
  | typeof StrokeToolModule
  | typeof TextToolModule

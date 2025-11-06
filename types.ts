// Base types
export interface StrokePoint {
  x: number
  y: number
  pressure?: number
  // Optional stylus data
  tiltX?: number
  tiltY?: number
  twist?: number
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

// Stroke types (discriminated union)
export interface PenStroke {
  type: "pen"
  points: StrokePoint[]
  color: string
  width: number
  bounds: Bounds
}

export interface MarkerStroke {
  type: "marker"
  points: StrokePoint[]
  color: string
  width: number
  bounds: Bounds
}

export type Stroke = PenStroke | MarkerStroke

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

// Application state
export interface AppState {
  strokes: Stroke[]
  currentPath: StrokePoint[]
  isDrawing: boolean
  activePointerId: number | null
  currentStrokeType: "pen" | "marker"
  color: string
  inkWidth: number
  viewBox: ViewBox
  isPanning: boolean
  panStart: { x: number; y: number } | null
}

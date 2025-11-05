export interface Point {
  x: number
  y: number
  pressure?: number
  tiltX?: number
  tiltY?: number
  twist?: number
  altitudeAngle?: number
  azimuthAngle?: number
  pointerType?: string
}

export interface Path {
  points: Point[]
  color: string
  width: number
  isPenPath?: boolean
  pressureSensitive?: boolean
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

export interface AppState {
  paths: Path[]
  currentPath: Point[]
  isDrawing: boolean
  activePointerId: number | null
  color: string
  brushWidth: number
  viewBox: ViewBox
  spacePressed: boolean
  isPanning: boolean
  panStart: Point | null
  pressureSensitive: boolean
  maxPressureWidth: number
  tiltSensitive: boolean
}

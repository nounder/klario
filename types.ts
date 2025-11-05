export interface Point {
  x: number
  y: number
}

export interface Path {
  points: Point[]
  color: string
  width: number
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
  color: string
  brushWidth: number
  viewBox: ViewBox
  spacePressed: boolean
  isPanning: boolean
  panStart: Point | null
}

import type { JSX } from "solid-js"
import type { StrokePoint } from "../types"

export type StrokeOptions = {
  width: number
  color: string
}

export type StrokeModule = {
  path: (points: StrokePoint[], options: { width: number }) => string
  render: (points: StrokePoint[], options: StrokeOptions) => JSX.Element
}

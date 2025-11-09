import { createStore } from "solid-js/store"
import type { SetStoreFunction } from "solid-js/store"
import type { AppState, ImageToolState } from "../types"

import * as ImageNode from "../nodes/ImageNode"
import type { Node, StrokePoint } from "../types"
import * as Unique from "../Unique"

export const NodeType = ImageNode.Type

export const initialState: ImageToolState = {
  uri: "",
  width: 200,
  height: 200,
}

export function onPointerEnter(helpers: {
  setAppStore: (updates: any) => void
}) {
  helpers.setAppStore({ rootStyle: {} })
}

export function onPointerLeave(helpers: {
  setAppStore: (updates: any) => void
}) {
  helpers.setAppStore({ rootStyle: {} })
}

export function onPointerDown(helpers: {
  point: StrokePoint
  state: ImageToolState
  addNode: (node: Node) => void
}) {
  if (helpers.state.uri) {
    const newNode: Node = {
      id: Unique.token(16),
      type: "ImageNode",
      parent: null,
      bounds: {
        x: helpers.point.x,
        y: helpers.point.y,
        width: helpers.state.width,
        height: helpers.state.height,
      },
      locked: false,
      uri: helpers.state.uri,
    }
    helpers.addNode(newNode)
  }
}

export function renderSettings(props: {
  setStore: SetStoreFunction<AppState>
  activeNode: Node | null
}) {
  const [state, setState] = createStore<ImageToolState>(initialState)

  return {
    state,
    setState,
    ui: (
      <>
        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <input
            type="text"
            placeholder="Image URL"
            value={state.uri}
            onInput={(e) => setState("uri", e.currentTarget.value)}
            style={{
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.5)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              "border-radius": "10px",
              "font-size": "13px",
              "min-width": "200px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ "font-size": "13px", "font-weight": "600" }}>
            Width:
            <input
              type="range"
              min={50}
              max={500}
              value={state.width}
              onInput={(e) =>
                setState("width", parseInt(e.currentTarget.value))}
              style={{
                width: "100px",
                "margin-left": "8px",
              }}
            />
            {state.width}px
          </label>
        </div>

        <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
          <label style={{ "font-size": "13px", "font-weight": "600" }}>
            Height:
            <input
              type="range"
              min={50}
              max={500}
              value={state.height}
              onInput={(e) =>
                setState("height", parseInt(e.currentTarget.value))}
              style={{
                width: "100px",
                "margin-left": "8px",
              }}
            />
            {state.height}px
          </label>
        </div>
      </>
    ),
  }
}

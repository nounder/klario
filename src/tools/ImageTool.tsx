import { createStore } from "solid-js/store"

import CollapsibleSetting from "../CollapsibleSetting.tsx"
import * as ImageNode from "../nodes/ImageNode.tsx"
import type { Node } from "../nodes/index.ts"
import * as Unique from "../Unique.ts"
import * as Tool from "./Tool.ts"

export const NodeType = ImageNode.Type

export const make = Tool.build(() => {
  const [state, setState] = createStore({
    uri: "",
    width: 200,
    height: 200,
  })

  return {
    onPointerDown: (ctx) => {
      if (state.uri) {
        const newNode: Node = {
          id: Unique.token(16),
          type: "ImageNode",
          parent: null,
          bounds: {
            x: ctx.point.x,
            y: ctx.point.y,
            width: state.width,
            height: state.height,
          },
          locked: false,
          uri: state.uri,
        }
        ctx.addNode(newNode)
      }
    },
    renderSettings: () => (
      <>
        <CollapsibleSetting icon="🔗" title="Image URL">
          <input
            type="text"
            placeholder="Image URL"
            value={state.uri}
            onInput={(e) => setState("uri", e.currentTarget.value)}
            class="px-3 py-2 bg-white/50 border-2 border-white/30 rounded-lg text-[11px] w-full box-border"
          />
        </CollapsibleSetting>

        <CollapsibleSetting icon="↔️" title="Width">
          <div class="flex flex-col gap-2 w-full items-center">
            <input
              type="range"
              min={50}
              max={500}
              value={state.width}
              onInput={(e) =>
                setState("width", parseInt(e.currentTarget.value))}
              class="w-full h-1.5 bg-white/30 rounded outline-none appearance-none"
            />
            <span class="font-semibold text-black/70 text-[11px] bg-white/50 px-1.5 py-0.5 rounded-md border border-white/30">
              {state.width}px
            </span>
          </div>
        </CollapsibleSetting>

        <CollapsibleSetting icon="↕️" title="Height">
          <div class="flex flex-col gap-2 w-full items-center">
            <input
              type="range"
              min={50}
              max={500}
              value={state.height}
              onInput={(e) =>
                setState("height", parseInt(e.currentTarget.value))}
              class="w-full h-1.5 bg-white/30 rounded outline-none appearance-none"
            />
            <span class="font-semibold text-black/70 text-[11px] bg-white/50 px-1.5 py-0.5 rounded-md border border-white/30">
              {state.height}px
            </span>
          </div>
        </CollapsibleSetting>
      </>
    ),
  }
})

import { For } from "solid-js"
import * as Data from "./data.ts"
import * as Router from "./Router.tsx"

const drawingEntries = Object.entries(Data.Drawings)

const thumbnailTransitionName = (key: string) => `drawing-preview-${key}`

export function DrawingGrid() {
  const handleDrawingClick = (key: string) => {
    Router.navigateTransition(`/drawing?id=${key}`)
  }

  return (
    <div class="grid grid-cols-3 gap-6 grow content-start">
      <For each={drawingEntries}>
        {([key, drawing]) => (
          <div
            class="drawing-item-3d cursor-pointer rounded-xl overflow-hidden shadow-md bg-white flex flex-col"
            onClick={() => handleDrawingClick(key)}
            style={{
              "view-transition-name": thumbnailTransitionName(key),
            }}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width - 0.5
              const y = (e.clientY - rect.top) / rect.height - 0.5
              e.currentTarget.style.setProperty("--x", x.toString())
              e.currentTarget.style.setProperty("--y", y.toString())
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.setProperty("--x", "0")
              e.currentTarget.style.setProperty("--y", "0")
            }}
          >
            <div class="w-full aspect-[3/2] overflow-hidden">
              <img
                src={drawing.imageUrl}
                alt="Drawing"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

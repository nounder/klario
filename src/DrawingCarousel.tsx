import { For } from "solid-js"
import * as Data from "./data.ts"
import * as Router from "./Router.tsx"

const drawingEntries = Object.entries(Data.Drawings)

const thumbnailTransitionName = (key: string) => `drawing-preview-${key}`

export function DrawingCarousel() {
  const handleSelect = (key: string) => {
    Router.navigateTransition(`/drawing?id=${key}`)
  }

  return (
    <div
      style={{
        display: "flex",
        "overflow-x": "auto",
        "scroll-snap-type": "x mandatory",
        gap: "1rem",
        padding: "1rem 6rem",
        height: "55dvh",
      }}
    >
      <For each={drawingEntries}>
        {([key, drawing], index) => (
          <div
            style={{
              "flex-shrink": "0",
              width: "calc(100% - 12rem)",
              height: "100%",
              "scroll-snap-align": "center",
              "scroll-snap-stop": "always",
              display: "flex",
              "flex-direction": "column",
              gap: "1rem",
              "align-items": "center",
            }}
          >
            <div
              style={{
                "flex-grow": "1",
                "min-height": "0",
                width: "100%",
                display: "flex",
                "flex-direction": "column",
                "justify-content": "center",
                "align-items": "center",
              }}
            >
              <div
                style={{
                  "border-radius": "0.75rem",
                  overflow: "hidden",
                  "box-shadow":
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  background: "white",
                  "view-transition-name": thumbnailTransitionName(key),
                  "max-height": "100%",
                  "max-width": "100%",
                  display: "inline-flex",
                }}
              >
                <img
                  src={drawing.imageUrl}
                  alt="Drawing"
                  style={{
                    "max-width": "100%",
                    "max-height": "100%",
                    width: "auto",
                    height: "auto",
                    "object-fit": "contain",
                    display: "block",
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => handleSelect(key)}
              class="px-8 py-4 bg-red-400 text-white border-4 border-gray-800 rounded-2xl cursor-pointer transition-all shadow-[4px_4px_0_#1f2937] hover:bg-red-500 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1f2937] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#1f2937]"
              style={{
                "font-family": "Chewy, cursive",
                "font-size": "1.5rem",
              }}
            >
              Select
            </button>
          </div>
        )}
      </For>
    </div>
  )
}

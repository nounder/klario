import { For } from "solid-js"
import Bangkok2025ArabicaSvg from "../../assets/Bangkok2025Arabica.svg"
import * as Router from "../Router.tsx"
import * as ViewTransitions from "../ViewTransitions.ts"

type DrawingItem = {
  imageUri: string
  title: string
}

const drawingItems: DrawingItem[] = [
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 1" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 2" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 3" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 4" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 5" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 6" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 7" },
  { imageUri: Bangkok2025ArabicaSvg, title: "Drawing 8" },
]

export function DrawingListPage() {
  const handleDrawingClick = (index: number) => {
    Router.navigateTransition(`/drawing?id=${index}`)
  }

  return (
    <>
      <div
        style={{
          flex: "1",
          display: "flex",
          "flex-direction": "column",
          "min-width": 0,
        }}
      >
        <h1
          style={{
            margin: "0 0 40px 0",
            "font-size": "48px",
            color: "white",
            "text-shadow": "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          My Drawings
        </h1>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(4, 1fr)",
            gap: "24px",
            "flex-grow": 1,
            "align-content": "start",
          }}
        >
          <For each={drawingItems}>
            {(item, index) => (
              <div
                onClick={() => handleDrawingClick(index())}
                style={{
                  cursor: "pointer",
                  "border-radius": "12px",
                  overflow: "hidden",
                  "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "background-color": "white",
                  display: "flex",
                  "flex-direction": "column",
                  "view-transition-name": ViewTransitions
                    .getDrawingTransitionName(
                      index(),
                    ),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0, 0, 0, 0.2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
              >
                <div
                  style={{
                    width: "100%",
                    "aspect-ratio": "3 / 2",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.imageUri}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      "object-fit": "cover",
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "16px",
                    "font-size": "16px",
                    "font-weight": "500",
                    color: "#333",
                  }}
                >
                  {item.title}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  )
}

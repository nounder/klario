import { For } from "solid-js"
import Bangkok2025ArabicaSvg from "../../assets/Bangkok2025Arabica.svg"
import * as Router from "../Router.tsx"

type DrawingItem = {
  imageUri: string
}

const drawingItems: DrawingItem[] = [
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
  { imageUri: Bangkok2025ArabicaSvg },
]

const thumbnailTransitionName = (id: number) => `drawing-preview-${id}`

function Headline() {
  const text = "KLAROWANKI"
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
  ]

  return (
    <>
      <style>
        {`
          @keyframes squiggle {
            0%, 100% {
              transform: rotate(var(--base-rotation));
            }
            33% {
              transform: rotate(calc(var(--base-rotation) + var(--wobble-amount) * 0.7));
            }
            66% {
              transform: rotate(calc(var(--base-rotation) - var(--wobble-amount) * 0.5));
            }
          }
          
          .headline-letter {
            display: inline-block;
            animation: squiggle 2.5s ease-in-out infinite;
            animation-delay: calc(var(--letter-index) * 0.08s);
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          "justify-content": "center",
        }}
      >
        <h1
          style={{
            margin: "0 0 40px 0",
            "font-size": "48px",
            "font-weight": "900",
            "text-shadow": "0 2px 8px rgba(0, 0, 0, 0.2)",
            "letter-spacing": "1rem",
          }}
        >
          <For each={text.split("")}>
            {(letter, index) => {
              const baseRotation = Math.random() * 16 - 8
              const wobbleAmount = Math.random() * 8 + 4
              return (
                <span
                  class="headline-letter"
                  style={{
                    color: colors[index() % colors.length],
                    "--base-rotation": `${baseRotation}deg`,
                    "--wobble-amount": `${wobbleAmount}deg`,
                    "--letter-index": index(),
                  }}
                >
                  {letter}
                </span>
              )
            }}
          </For>
        </h1>
      </div>
    </>
  )
}

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
        <Headline />

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
                class="drawing-item-3d"
                onClick={() => handleDrawingClick(index())}
                style={{
                  cursor: "pointer",
                  "border-radius": "12px",
                  "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.1)",
                  "background-color": "white",
                  display: "flex",
                  "flex-direction": "column",
                  "view-transition-name": thumbnailTransitionName(index()),
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
                <div
                  style={{
                    width: "100%",
                    "aspect-ratio": "3 / 2",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.imageUri}
                    alt="Drawing"
                    style={{
                      width: "100%",
                      height: "100%",
                      "object-fit": "cover",
                    }}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  )
}

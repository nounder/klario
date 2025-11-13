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
      <div class="flex justify-center">
        <h1 class="text-5xl font-black tracking-[1rem]">
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
      <div class="flex-1 flex flex-col min-w-0">
        <div class="mb-8">
          <Headline />
        </div>

        <div class="grid grid-cols-4 gap-6 grow content-start">
          <For each={drawingItems}>
            {(item, index) => (
              <div
                class="drawing-item-3d cursor-pointer rounded-xl shadow-md bg-white flex flex-col"
                onClick={() => handleDrawingClick(index())}
                style={{
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
                <div class="w-full aspect-[3/2] overflow-hidden">
                  <img
                    src={item.imageUri}
                    alt="Drawing"
                    class="w-full h-full object-cover"
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

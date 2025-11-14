import { For } from "solid-js"
import Bangkok2025ArabicaSvg from "../../assets/Bangkok2025Arabica.svg"
import Headline from "../Headline.tsx"
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

export function DrawingListPage() {
  const handleDrawingClick = (index: number) => {
    Router.navigateTransition(`/drawing?id=${index}`)
  }

  return (
    <>
      <div class="flex-1 flex flex-col min-w-0">
        <div class="mx-auto mb-8 w-full max-w-3xl">
          <Headline />
        </div>

        <div class="grid grid-cols-3 gap-6 grow content-start">
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

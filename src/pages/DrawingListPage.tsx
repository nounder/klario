import * as DrawingCarousel from "../DrawingCarousel.tsx"
import { DrawingGrid } from "../DrawingGrid.tsx"
import Headline from "../Headline.tsx"

export function DrawingListPage() {
  return (
    <>
      <div class="flex-1 flex flex-col min-w-0 h-full m-4">
        <div class="mx-auto mt-8 mb-8 w-full max-w-3xl">
          <Headline />
        </div>
        <DrawingGrid />
      </div>
    </>
  )
}

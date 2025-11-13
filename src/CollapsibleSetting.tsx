import type { JSX } from "solid-js"

export default function (props: {
  icon: JSX.Element
  title: string
  children: JSX.Element
}) {
  const popoverId = `popover-${Math.random().toString(36).slice(2, 9)}`

  return (
    <>
      <button
        id={`anchor-${popoverId}`}
        type="button"
        popovertarget={popoverId}
        popovertargetaction="toggle"
        class="w-9 h-9 bg-white/80 border-2 border-white/30 rounded-lg cursor-pointer text-lg shadow-md transition-all duration-200 ease-in-out flex items-center justify-center"
        style={{
          // @ts-ignore - CSS Anchor Positioning
          "anchor-name": `--anchor-${popoverId}`,
        }}
        title={props.title}
      >
        {props.icon}
      </button>

      <div
        id={popoverId}
        popover="auto"
        class="m-0 p-3 bg-white/95 backdrop-blur-xl border-2 border-blue-500/30 rounded-xl shadow-xl"
        style={{
          // @ts-ignore - CSS Anchor Positioning
          "position-anchor": `--anchor-${popoverId}`,
          // @ts-ignore - CSS Anchor Positioning
          "position-area": "right",
          "-webkit-backdrop-filter": "blur(20px)",
        }}
      >
        {props.children}
      </div>
    </>
  )
}

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
        style={{
          width: "36px",
          height: "36px",
          background: "rgba(255, 255, 255, 0.8)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          "border-radius": "8px",
          cursor: "pointer",
          "font-size": "18px",
          "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
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
        style={{
          // @ts-ignore - CSS Anchor Positioning
          "position-anchor": `--anchor-${popoverId}`,
          // @ts-ignore - CSS Anchor Positioning
          "position-area": "right",
          margin: "0",
          padding: "12px",
          background: "rgba(255, 255, 255, 0.95)",
          "backdrop-filter": "blur(20px)",
          "-webkit-backdrop-filter": "blur(20px)",
          border: "2px solid rgba(59, 130, 246, 0.3)",
          "border-radius": "12px",
          "box-shadow": "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        {props.children}
      </div>
    </>
  )
}

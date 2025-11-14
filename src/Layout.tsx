import type { FlowProps } from "solid-js"
import ZooBackgroundSvg from "../assets/ZooBackground.svg"

export function Layout(props: FlowProps) {
  return (
    <div
      class="flex flex-1"
      style={{
        background:
          `linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 50%, rgba(240, 147, 251, 0.6) 100%),
          linear-gradient(rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.7) 100%),
          url(${ZooBackgroundSvg}) repeat`,
        "background-blend-mode": "overlay, normal, normal",
      }}
    >
      {props.children}
    </div>
  )
}

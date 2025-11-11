import type { FlowProps } from "solid-js"
import * as ZooBackground from "./ZooBackground.tsx"

export function Layout(props: FlowProps) {
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "row",
        height: "100%",
        width: "100%",
        position: "relative",
        padding: "2rem",
      }}
    >
      <ZooBackground.ZooBackground />
      {props.children}
    </div>
  )
}

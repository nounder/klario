import ZooBackgroundSvg from "../assets/ZooBackground.svg"

export function ZooBackground() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%), url(${ZooBackgroundSvg}) repeat`,
        "background-blend-mode": "overlay",
        opacity: 0.2,
        "z-index": -1,
      }}
    />
  )
}

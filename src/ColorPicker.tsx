import { For } from "solid-js"

export default function ColorPicker(props: {
  colors: string[]
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div
      style={{
        display: "grid",
        "grid-template-columns": "1fr 1fr",
        gap: "8px",
        width: "100%",
        padding: "12px 8px", // Prevent clipping from parent overflow:auto on hover scale
      }}
    >
      <For each={props.colors}>
        {(c, i) => {
          // Generate consistent random rotation based on index
          const baseRotation = (i() * 7 % 13) - 6 // Range: -6 to 6 degrees

          return (
            <button
              onClick={() => props.onChange(c)}
              onMouseEnter={(e) => {
                if (props.value !== c) {
                  e.currentTarget.style.transform =
                    `scale(1.1) rotate(${baseRotation}deg)`
                }
              }}
              onMouseLeave={(e) => {
                if (props.value !== c) {
                  e.currentTarget.style.transform =
                    `scale(1) rotate(${baseRotation}deg)`
                }
              }}
              style={{
                width: "36px",
                height: "36px",
                border: props.value === c
                  ? "3px solid rgba(0, 0, 0, 0.6)"
                  : "2px solid rgba(255, 255, 255, 0.3)",
                background: c,
                cursor: "pointer",
                "border-radius": "8px",
                "box-shadow": props.value === c
                  ? "0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.5)"
                  : "0 2px 8px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
                transform: props.value === c
                  ? `scale(1.1) rotate(${baseRotation}deg)`
                  : `scale(1) rotate(${baseRotation}deg)`,
              }}
              title={c}
            />
          )
        }}
      </For>
    </div>
  )
}

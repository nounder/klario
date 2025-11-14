import { For } from "solid-js"

export default function ColorPicker(props: {
  colors: string[]
  value: string
  onChange: (color: string) => void
  onColorPicked?: () => void
}) {
  return (
    <div class="grid grid-cols-2 gap-4 w-full px-2 py-3">
      <For each={props.colors}>
        {(c, i) => {
          // Generate consistent random rotation based on index
          const baseRotation = (i() * 7 % 13) - 6 // Range: -6 to 6 degrees

          return (
            <button
              onClick={() => {
                props.onChange(c)
                props.onColorPicked?.()
              }}
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
              class="w-9 h-9 cursor-pointer rounded-lg transition-all duration-200 ease-in-out relative overflow-hidden"
              classList={{
                "shadow-lg": props.value === c,
                "border-2 border-white/30 shadow-md": props.value !== c,
              }}
              style={{
                background:
                  `linear-gradient(135deg, ${c} 0%, color-mix(in srgb, ${c} 80%, black) 100%)`,
                transform: props.value === c
                  ? `scale(1.1) rotate(${baseRotation}deg)`
                  : `scale(1) rotate(${baseRotation}deg)`,
                "box-shadow": props.value === c
                  ? "0 4px 12px rgba(0,0,0,0.3)"
                  : "0 2px 6px rgba(0,0,0,0.2)",
                ...(props.value === c
                  ? {
                    border: "2px solid rgba(255, 255, 255, 0.7)",
                    outline:
                      `3px solid color-mix(in srgb, ${c} 50%, transparent)`,
                  }
                  : {}),
              }}
              title={c}
            >
              <div
                class="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 40%, transparent 60%)",
                }}
              />
            </button>
          )
        }}
      </For>
    </div>
  )
}

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
              class="w-9 h-9 cursor-pointer rounded-lg transition-all duration-200 ease-in-out"
              classList={{
                "shadow-lg": props.value === c,
                "border-2 border-white/30 shadow-md": props.value !== c,
              }}
              style={{
                background: c,
                transform: props.value === c
                  ? `scale(1.1) rotate(${baseRotation}deg)`
                  : `scale(1) rotate(${baseRotation}deg)`,
                ...(props.value === c
                  ? {
                    border: "2px solid white",
                    outline: `3px solid ${c}`,
                    "outline-offset": "0px",
                  }
                  : {}),
              }}
              title={c}
            />
          )
        }}
      </For>
    </div>
  )
}

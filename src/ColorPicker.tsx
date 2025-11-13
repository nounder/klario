import { For } from "solid-js"

export default function ColorPicker(props: {
  colors: string[]
  value: string
  onChange: (color: string) => void
  onColorPicked?: () => void
}) {
  return (
    <div class="grid grid-cols-2 gap-2 w-full px-2 py-3">
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
                "border-[3px] border-black/60 shadow-lg ring-2 ring-white/50":
                  props.value === c,
                "border-2 border-white/30 shadow-md": props.value !== c,
              }}
              style={{
                background: c,
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

import { For } from "solid-js"
import type { SetStoreFunction } from "solid-js/store"
import type { AppState } from "./types"

interface CanvasToolbarProps {
  store: AppState
  setStore: SetStoreFunction<AppState>
}

// Reusable Label component
function Label(props: { children: any }) {
  return (
    <label style={{ 
      "font-weight": "600", 
      color: "rgba(0, 0, 0, 0.8)",
      "font-size": "14px",
      "letter-spacing": "0.5px"
    }}>
      {props.children}
    </label>
  )
}

// Color picker subcomponent
function ColorPicker(props: { colors: string[], currentColor: string, onColorChange: (color: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <Label>Color:</Label>
      <For each={props.colors}>
        {(c) => (
          <button
            onClick={() => props.onColorChange(c)}
            style={{
              width: "36px",
              height: "36px",
              border: props.currentColor === c
                ? "3px solid rgba(0, 0, 0, 0.6)"
                : "2px solid rgba(255, 255, 255, 0.3)",
              background: c,
              cursor: "pointer",
              "border-radius": "12px",
              "box-shadow": props.currentColor === c 
                ? "0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.5)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
              transform: props.currentColor === c ? "scale(1.1)" : "scale(1)",
            }}
            title={c}
          />
        )}
      </For>
    </div>
  )
}

// Range slider subcomponent
function RangeControl(props: {
  label: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  unit?: string
  width?: string
}) {
  return (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <Label>{props.label}:</Label>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onInput={(e) => props.onChange(parseInt(e.currentTarget.value))}
        style={{ 
          width: props.width || "140px",
          height: "6px",
          background: "rgba(255, 255, 255, 0.3)",
          "border-radius": "3px",
          outline: "none",
          appearance: "none",
          "-webkit-appearance": "none",
        }}
      />
      <span style={{ 
        "min-width": "40px",
        "font-weight": "600",
        color: "rgba(0, 0, 0, 0.7)",
        "font-size": "13px",
        background: "rgba(255, 255, 255, 0.5)",
        padding: "4px 8px",
        "border-radius": "8px",
        border: "1px solid rgba(255, 255, 255, 0.3)"
      }}>
        {props.value}{props.unit || ""}
      </span>
    </div>
  )
}

// Checkbox control subcomponent
function CheckboxControl(props: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
      <Label>
        <input
          type="checkbox"
          checked={props.checked}
          onChange={(e) => props.onChange(e.currentTarget.checked)}
          style={{ "margin-right": "6px" }}
        />
        {props.label}
      </Label>
    </div>
  )
}

// Action button subcomponent
function ActionButton(props: {
  onClick: () => void
  children: any
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "12px 20px",
        background: "rgba(239, 68, 68, 0.9)",
        "backdrop-filter": "blur(10px)",
        "-webkit-backdrop-filter": "blur(10px)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        "border-radius": "12px",
        cursor: "pointer",
        "font-weight": "600",
        "font-size": "14px",
        "letter-spacing": "0.5px",
        "box-shadow": "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(239, 68, 68, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)";
      }}
    >
      {props.children}
    </button>
  )
}

// Main toolbar component
export default function CanvasToolbar(props: CanvasToolbarProps) {
  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ]

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        "backdrop-filter": "blur(20px) saturate(180%)",
        "-webkit-backdrop-filter": "blur(20px) saturate(180%)",
        padding: "20px 24px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        "border-radius": "0 0 20px 20px",
        "box-shadow": "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 16px rgba(0, 0, 0, 0.05)",
        display: "flex",
        gap: "20px",
        "align-items": "center",
        "flex-wrap": "wrap",
        position: "relative",
        "z-index": 10,
      }}
    >
      <ColorPicker 
        colors={colors}
        currentColor={props.store.color}
        onColorChange={(c) => props.setStore("color", c)}
      />

      <RangeControl
        label="Brush Size"
        min={1}
        max={20}
        value={props.store.brushWidth}
        onChange={(value) => props.setStore("brushWidth", value)}
        unit="px"
      />

      <CheckboxControl
        label="Pressure"
        checked={props.store.pressureSensitive}
        onChange={(checked) => props.setStore("pressureSensitive", checked)}
      />

      <RangeControl
        label="Max Pressure"
        min={5}
        max={50}
        value={props.store.maxPressureWidth}
        onChange={(value) => props.setStore("maxPressureWidth", value)}
        unit="px"
        width="100px"
      />

      <ActionButton onClick={() => props.setStore({ paths: [], currentPath: [] })}>
        Clear Canvas
      </ActionButton>
    </div>
  )
}

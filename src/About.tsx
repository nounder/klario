import * as Router from "./Router.tsx"

export function About(props: { name?: string }) {
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        height: "100vh",
        width: "100vw",
        padding: "20px",
        "box-sizing": "border-box",
      }}
    >
      <h1>About klario</h1>
      {props.name && <p>Hello, {props.name}!</p>}
      <p>A modern drawing canvas application built with SolidJS.</p>
      <button
        onClick={() => Router.navigate("/")}
        style={{
          "margin-top": "20px",
          padding: "10px 20px",
          "font-size": "16px",
          cursor: "pointer",
        }}
      >
        Back to Canvas
      </button>
    </div>
  )
}

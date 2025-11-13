import * as Router from "../Router.tsx"

export function About(props: { name?: string }) {
  return (
    <div class="flex flex-col items-center justify-center h-screen w-screen p-5 box-border">
      <h1>
        About klario
      </h1>
      {props.name && (
        <p>
          Hello, {props.name}!
        </p>
      )}
      <p>
        A modern drawing canvas application built with SolidJS.
      </p>
      <button
        onClick={() => Router.navigate("/")}
        class="mt-5 px-5 py-2.5 text-base cursor-pointer"
      >
        Back to Canvas
      </button>
    </div>
  )
}

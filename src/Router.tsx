import type { JSX } from "solid-js"
import { createSignal, onMount } from "solid-js"

const [currentPath, setCurrentPath] = createSignal<string>(
  typeof window !== "undefined" ? window.location.pathname : "/",
)

export type Route = {
  path: string
  render: (
    route: { path: string; params: Record<string, string> },
  ) => JSX.Element
}

export function navigate(url: string) {
  window.history.pushState({}, "", url)
  setCurrentPath(window.location.pathname)
}

export function navigateTransition(url: string) {
  if (typeof document === "undefined" || !document.startViewTransition) {
    navigate(url)
    return
  }

  document.startViewTransition(() => {
    navigate(url)
  })
}

export function Router(props: { routes: Route[] }) {
  const matchRoute = (pathname: string): Route | undefined => {
    return props.routes.find((route) => pathname === route.path)
  }

  onMount(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  })

  const renderCurrentRoute = () => {
    const pathname = currentPath()
    const matched = matchRoute(pathname)

    if (!matched) {
      return (
        <div>
          404 - Not Found
        </div>
      )
    }

    const params = Object.fromEntries(
      new URLSearchParams(window.location.search),
    )

    return matched.render({ path: pathname, params })
  }

  return (
    <>
      {renderCurrentRoute()}
    </>
  )
}

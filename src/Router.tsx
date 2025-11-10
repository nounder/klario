import type { JSX } from "solid-js"
import { createSignal, onCleanup, onMount } from "solid-js"

export type Route = {
  path: string
  render: (
    route: { path: string; params: Record<string, string> },
  ) => JSX.Element
}

export function navigate(url: string) {
  window.history.pushState({}, "", url)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

export function Router(props: { routes: Route[] }) {
  const [currentPath, setCurrentPath] = createSignal<string>(
    window.location.pathname,
  )

  const matchRoute = (pathname: string): Route | undefined => {
    return props.routes.find((route) => pathname === route.path)
  }

  const handlePopState = () => {
    setCurrentPath(window.location.pathname)
  }

  onMount(() => {
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

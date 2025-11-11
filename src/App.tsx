import * as About from "./pages/About.tsx"
import * as Drawing from "./pages/Drawing.tsx"
import * as Router from "./Router.tsx"

export default function App() {
  const routes: Router.Route[] = [
    {
      path: "/",
      render: () => <Drawing.Drawing />,
    },
    {
      path: "/about",
      render: (route) => <About.About name={route.params.name} />,
    },
  ]

  return <Router.Router routes={routes} />
}

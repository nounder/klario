import * as Layout from "./Layout.tsx"
import * as About from "./pages/About.tsx"
import * as DrawingPage from "./pages/DrawingPage.tsx"
import * as DrawingListPage from "./pages/DrawingListPage.tsx"
import * as Router from "./Router.tsx"

export default function App() {
  const routes: Router.Route[] = [
    {
      path: "/",
      render: () => <DrawingListPage.DrawingListPage />,
    },
    {
      path: "/drawing",
      render: (route) => <DrawingPage.DrawingPage id={route.params.id} />,
    },
    {
      path: "/about",
      render: (route) => <About.About name={route.params.name} />,
    },
  ]

  return (
    <Layout.Layout>
      <Router.Router routes={routes} />
    </Layout.Layout>
  )
}

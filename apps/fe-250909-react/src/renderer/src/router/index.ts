import App from '@renderer/App'
import { createBrowserRouter, RouteObject } from 'react-router'

const routes: RouteObject[] = [
  {
    path: '/',
    Component: App
  }
]

const router = createBrowserRouter(routes)

export default router

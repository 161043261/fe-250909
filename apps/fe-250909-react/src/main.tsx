import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from "./App.tsx";
import './assets/main.css'
import { RouterProvider } from 'react-router'
import router from './router/main'

const container = document.getElementById('root')

if (container) {
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

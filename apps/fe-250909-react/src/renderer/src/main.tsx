import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import router from './router'

const rootContainer = document.getElementById('root')

if (rootContainer) {
  const root = createRoot(rootContainer)

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}

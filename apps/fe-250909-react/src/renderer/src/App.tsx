import { ReactElement } from 'react'
import { RouterProvider } from 'react-router'
import router from './router'

function App(): ReactElement {
  const handleIpc = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <RouterProvider router={router} />
      <a target="_blank" rel="noreferrer" onClick={handleIpc}>
        ping
      </a>
    </>
  )
}

export default App

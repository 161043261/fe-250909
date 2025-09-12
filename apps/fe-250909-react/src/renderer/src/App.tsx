import { ReactElement } from 'react'

function App(): ReactElement {
  const handleIpc = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <a target="_blank" rel="noreferrer" onClick={handleIpc}>
        ping
      </a>
    </>
  )
}

export default App

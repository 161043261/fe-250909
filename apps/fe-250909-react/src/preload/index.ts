import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import jsonObj from './api.json'
import { TApi, TMainWindowMsg } from '@common/types'

// Custom APIs for renderer

function createApi(): TApi {
  const api: TApi = {
    sendMainWindowMsg: (msg: TMainWindowMsg) => {
      // ipcMain.on('main-window-msg', (ev, msg: TMainWindowMsg): void => {})
      return ipcRenderer.send('main-window-msg', msg)
    },
    invokeReadJsonFile: (filename: string) => {
      // ipcMain.handle('read-json-file', async (ev, filename: string): Promise<unknown> => {})
      return ipcRenderer.invoke('read-json-file', filename)
    }
  }
  for (const [serviceName, fnNameList] of Object.entries(jsonObj)) {
    api[serviceName] = {}
    for (const fnName of fnNameList) {
      api[serviceName][fnName] = (...args: unknown[]) => {
        return ipcRenderer.invoke(`${serviceName}.${fnName}`, ...args)
      }
    }
  }
  return api
}

// Use `contextBridge` APIs to expose Electron APIs to renderer only if context isolation is enabled,
// otherwise just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', createApi())
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

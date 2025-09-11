import { app, shell, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.jpg?asset'

import settingsService from './settings-service'

// // Disables hardware acceleration for current app.
// app.disableHardwareAcceleration()

// The return value of this method indicates whether or not this instance of your application successfully obtained the lock.
// If it failed to obtain the lock, you can assume that another instance of your application is already running with the lock and exit immediately.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (/** ev, argv, workingDirectory, additionalData */) => {
    if (!mainWindow) {
      return
    }
    if (!mainWindow.isVisible()) {
      // Shows and gives focus to the window.
      mainWindow.show()
    }
    if (mainWindow.isMinimized()) {
      // Restores the window from minimized state to its previous state.
      mainWindow.restore()
    }
    // Focuses on the window.
    mainWindow.focus()
  })
}

if (!settingsService.getAppSettings().debug) {
  Menu.setApplicationMenu(null)
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): void {
  if (mainWindow) {
    return
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    // Window's width in pixels
    width: 1080,
    // Window's minimum width.
    minWidth: 1080,
    // Window's height in pixels.
    height: 720,
    // Window's minimum height.
    minHeight: 720,
    // Specify false to create a frameless window.
    frame: false,
    // Whether window is resizable.
    resizable: true,
    // Whether the window should show in fullscreen.
    fullscreen: false,
    // Whether the window can be put into fullscreen mode.
    fullscreenable: false,
    // Whether window is maximizable.
    maximizable: true,

    // show: false,
    // autoHideMenuBar: true,

    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      // Whether to throttle animations and timers when the page becomes background.
      backgroundThrottling: true,
      // Whether node integration is enabled.
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js')
      // sandbox: false
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev /** !app.isPackaged */ && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', (ev) => {
    if (!settingsService.getAppSettings().closeDirectly) {
      ev.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.webContents.on('will-navigate', (details) => {
    const customProtocol = 'showfile:'

    if (details.url.startsWith(customProtocol)) {
      console.log(
        '[will-navigate] details.url.startsWith(customProtocol), details.url:',
        details.url
      )
      details.preventDefault()
      shell.showItemInFolder(decodeURI(details.url).slice(customProtocol.length))
      return
    }

    if (!details.isSameDocument) {
      console.log('[will-navigate] !details.isSameDocument, details.url:', details.url)
      details.preventDefault()
      shell.openExternal(details.url)
    }
  })

  mainWindow.webContents.on('before-input-event', (ev, input) => {
    if (input.key.toLowerCase() === 'f12') {
      mainWindow?.webContents.openDevTools()
      ev.preventDefault()
    }
  })

  // mainWindow.webContents.openDevTools()
}

function switchWindowVisibility(mainWindow: BrowserWindow | null): void {
  if (mainWindow?.isVisible()) {
    mainWindow.hide()
  } else {
    mainWindow?.show()
  }
}

function createTray(): void {
  if (tray) {
    return
  }
  tray = new Tray(icon /** image */)
  tray.setToolTip('星穹铁道工具箱')

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.focus()
    } else {
      switchWindowVisibility(mainWindow)
    }
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: mainWindow?.isVisible() ? '隐藏主界面' : '显示主界面',
        click: () => switchWindowVisibility(mainWindow)
      },
      {
        label: '退出',
        click: () => app.quit()
      }
    ])
    tray?.popUpContextMenu(contextMenu)
  })
}

app.on('ready', () => {
  createWindow()
  createTray()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

import { app, Menu, ipcMain, BrowserWindow, shell, Tray } from 'electron'
import { join, dirname } from 'path'
import { is, electronApp, optimizer } from '@electron-toolkit/utils'
import { readdir, writeFile, readFile } from 'fs/promises'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import __cjs_mod__ from 'node:module'
const __filename = import.meta.filename
const __dirname = import.meta.dirname
const require2 = __cjs_mod__.createRequire(import.meta.url)
const icon = join(__dirname, '../../resources/icon.jpg')
const configService$1 = ['getUserDataPath', 'getAppDataPath', 'getAppSettingsPath', 'getAppVersion']
const settingsService$1 = ['getAppSettings', 'setAppSettings']
const api = {
  configService: configService$1,
  settingsService: settingsService$1
}
class ConfigServiceImpl {
  userDataPath
  appDataPath
  appSettingsPath
  constructor() {
    this.userDataPath = app.getPath('userData')
    this.appDataPath = join(this.userDataPath, './data')
    if (!existsSync(this.appDataPath)) {
      mkdirSync(this.appDataPath)
    }
    this.appSettingsPath = join(this.appDataPath, './settings.json')
    if (is.dev) {
      this.walkDir('appDataPath:', this.appDataPath)
    }
  }
  async walkDir(name, absPath) {
    console.log(name, absPath)
    const entries = await readdir(absPath, {
      encoding: 'utf-8',
      withFileTypes: true
    })
    entries
      .filter((entry) => entry.isDirectory())
      .map((dir) => dir.name)
      .forEach((dirname2) => console.log(dirname2))
    entries
      .filter((entry) => entry.isFile())
      .map((file) => file.name)
      .forEach((filename) => console.log(filename))
  }
  getUserDataPath() {
    return this.userDataPath
  }
  getAppDataPath() {
    return this.appDataPath
  }
  getAppSettingsPath() {
    return this.appSettingsPath
  }
  getAppVersion() {
    return app.getVersion()
  }
}
const configService = new ConfigServiceImpl()
class SettingsServiceImpl {
  appSettings
  appSettingsPath
  defaultSettings = {
    debug: false,
    closeDirectly: false,
    themeColor: [170, 185, 165],
    lastAchievementUid: '000000000',
    lastGachaUid: '000000000',
    sidebarCollapsed: false,
    checkUpdateOnLaunch: false
  }
  constructor() {
    this.appSettingsPath = configService.getAppSettingsPath()
    if (!existsSync(this.appSettingsPath)) {
      this.appSettings = this.defaultSettings
    } else {
      const appSettingsStr = readFileSync(this.appSettingsPath, {
        encoding: 'utf-8'
      })
      this.appSettings = JSON.parse(appSettingsStr)
    }
    this.appSettings = {
      ...this.defaultSettings,
      ...this.appSettings
    }
    this.saveAppSettings()
  }
  async saveAppSettings() {
    await writeFile(this.appSettingsPath, JSON.stringify(this.appSettings, null, 2))
  }
  getAppSettings() {
    return this.appSettings
  }
  setAppSettings(key, value) {
    const oldValue = this.appSettings[key]
    if (key in this.appSettings && typeof oldValue === typeof value) {
      this.appSettings = {
        ...this.appSettings,
        [key]: value
      }
      this.saveAppSettings()
    }
    return this.appSettings
  }
}
const settingsService = new SettingsServiceImpl()
const services = {
  configService,
  settingsService
}
const dirPath = dirname(fileURLToPath(import.meta.url))
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) {
      return
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  })
}
if (!settingsService.getAppSettings().debug) {
  Menu.setApplicationMenu(null)
}
let mainWindow = null
let tray = null
function createMainWindow() {
  if (mainWindow) {
    return
  }
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
      preload: join(dirPath, '../preload/index.js')
      // sandbox: false
    }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(dirPath, '../renderer/index.html'))
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
}
function switchWindowVisibility(mainWindow2) {
  if (!mainWindow2) {
    return
  }
  if (mainWindow2.isVisible()) {
    mainWindow2.hide()
  } else {
    mainWindow2.show()
  }
}
function createTray() {
  if (tray) {
    return
  }
  tray = new Tray(
    icon
    /** image */
  )
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
  createMainWindow()
  createTray()
})
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.github.161043261')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  ipcMain.on('ping', () => console.log('pong'))
  createMainWindow()
  createTray()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
      createTray()
    }
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
for (const [serviceName, fnNameList] of Object.entries(api)) {
  for (const fnName of fnNameList) {
    ipcMain.handle(`${serviceName}.${fnName}`, async (ev, ...args) => {
      return await Promise.resolve(services[serviceName][fnName](...args))
    })
  }
}
ipcMain.on('main-window-msg', (ev, msg) => {
  switch (msg) {
    case 'close': {
      if (settingsService.getAppSettings().closeDirectly) {
        app.quit()
      }
      break
    }
    // case 'close'
    case 'esc': {
      switchWindowVisibility(mainWindow)
      break
    }
    // case 'esc'
    case 'maximize': {
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize()
        } else {
          mainWindow.maximize()
        }
      }
      break
    }
    // case 'maximize'
    case 'minimize': {
      if (mainWindow) {
        mainWindow?.minimize()
      }
      break
    }
    // case 'minimize'
    case 'reload': {
      if (mainWindow) {
        mainWindow.loadFile(join(dirPath, '../renderer/index.html'))
      }
      break
    }
  }
})
ipcMain.handle('read-json-file', async (ev, filenameNoExt) => {
  const jsonStr = await readFile(join(dirPath, `../static/json/${filenameNoExt}.json`), {
    encoding: 'utf-8'
  })
  return JSON.parse(jsonStr)
})

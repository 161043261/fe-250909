import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { join } from 'path'
import { readdir } from 'fs/promises'

export interface IConfigService {
  getUserDataPath: () => string
  getAppDataPath: () => string
  getAppSettingsPath: () => string
  getAppVersion: () => string
}

class ConfigServiceImpl implements IConfigService {
  private userDataPath: string
  private appDataPath: string
  private appSettingsPath: string

  constructor() {
    this.userDataPath = app.getPath('userData')
    this.appDataPath = app.getPath('appData')
    this.appSettingsPath = join(this.appDataPath, 'settings.json')

    if (is.dev) {
      this.walkDir('userDataPath', this.userDataPath)
      this.walkDir('appDataPath', this.appDataPath)
    }
  }

  private async walkDir(name: string, absPath: string): Promise<void> {
    console.log(name, absPath)
    const entries = await readdir(absPath, {
      encoding: 'utf-8',
      withFileTypes: true
    })
    entries
      .filter((entry) => entry.isDirectory())
      .map((dir) => dir.name)
      .forEach((dirname) => console.log(dirname))

    entries
      .filter((entry) => entry.isFile())
      .map((file) => file.name)
      .forEach((filename) => console.log(filename))
  }

  public getUserDataPath(): string {
    return this.userDataPath
  }

  public getAppDataPath(): string {
    return this.appDataPath
  }

  public getAppSettingsPath(): string {
    return this.appSettingsPath
  }

  public getAppVersion(): string {
    return app.getVersion()
  }
}

const configService: IConfigService = new ConfigServiceImpl()

export default configService

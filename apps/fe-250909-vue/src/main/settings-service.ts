import { existsSync, readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import configService from './config-service'
import { IAppSettings } from '@common/types/index'

class SettingsService {
  private appSettings: IAppSettings
  private appSettingsPath: string
  private defaultSettings: IAppSettings = {
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

  private async saveAppSettings(): Promise<void> {
    await writeFile(this.appSettingsPath, JSON.stringify(this.appSettings, null /** replacer */, 2))
  }

  public getAppSettings(): IAppSettings {
    return this.appSettings
  }

  public setAndGetAppSettings(key: keyof IAppSettings, value: unknown): IAppSettings {
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

export default new SettingsService()

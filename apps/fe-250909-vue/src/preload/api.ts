import { IAppSettings } from '@common/types'

export interface IConfigApi {
  getAppVersion: () => string
}

export interface ISettingsApi {
  getAppSettings: () => IAppSettings
}

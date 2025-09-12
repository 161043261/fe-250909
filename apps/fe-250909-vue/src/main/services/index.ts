import configService, { IConfigService } from './config'
export { default as configService } from './config'

import settingsService, { ISettingsService } from './settings'
export { default as settingsService } from './settings'

interface IServices {
  configService: IConfigService
  settingsService: ISettingsService
}

const services: IServices = {
  configService,
  settingsService
}

// Barrel Pattern
export default services

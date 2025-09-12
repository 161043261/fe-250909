export interface IAppSettings {
  debug: boolean
  closeDirectly: boolean
  themeColor: [number, number, number]
  lastAchievementUid: string
  lastGachaUid: string
  sidebarCollapsed: boolean
  checkUpdateOnLaunch: boolean
}

export type TMainWindowMsg = 'close' | 'esc' | 'maximize' | 'minimize' | 'reload'

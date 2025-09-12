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

export type TServiceName = 'achievement' | 'config' | 'gacha' | 'settings' | 'fps' | 'update'

export type TApi = {
  sendMainWindowMsg: (msg: TMainWindowMsg) => void
  invokeReadJsonFile: (filename: string) => Promise<unknown>
} & {
  [serviceName in TServiceName]?: {
    [fnName: string]: (...args: unknown[]) => Promise<unknown>
  }
}

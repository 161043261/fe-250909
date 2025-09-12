// @ts-check
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const targetFiles = [
  'AchievementData.json',
  'AchievementSeries.json',
  'AvatarConfig.json',
  'AvatarConfigLD.json',
  'EquipmentConfig.json',
  'GachaBasicInfo.json',
  'TextMapCHS.json',
]

const projectDir = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(projectDir, 'turnbasedgamedata')

const vueStaticDir = resolve(projectDir, 'apps/fe-250909-vue/src/static')
const reactStaticDir = resolve(projectDir, 'apps/fe-250909-react/src/static')

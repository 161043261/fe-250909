// @ts-check
import { copyFileSync, existsSync, mkdirSync, readdirSync, stat, statSync } from 'fs'
import { dirname, join, resolve } from 'path'
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

const vueStaticDir = resolve(projectDir, 'apps/fe-250909-vue/src/static/raw')
const reactStaticDir = resolve(projectDir, 'apps/fe-250909-react/src/static/raw')

/**
 *
 * @param {string} dirPath
 */
function mkdirRecursiveSync(dirPath) {
  if (!existsSync(dirPath)) {
    const parentDirPath = dirname(dirPath)
    mkdirRecursiveSync(parentDirPath)
    mkdirSync(dirPath)
  }
}

/**
 *
 * @param {string} searchDir
 * @param {string[]} filenames
 * @returns {Record<string, string>}
 */
function searchFileRecursiveSync(searchDir, filenames) {
  let /** @type {Record<string, string>} */ foundFiles = {}
  if (!existsSync(searchDir)) {
    return foundFiles
  }

  const entries = readdirSync(searchDir)
  for (const entry of entries) {
    const entryPath = join(searchDir, entry)
    const stat = statSync(entryPath)
    if (stat.isDirectory()) {
      const subFoundFiles = searchFileRecursiveSync(entryPath, filenames)
      foundFiles = {
        ...foundFiles,
        ...subFoundFiles,
      } // Object.assign(foundFiles, subFoundFiles)
    } else if (filenames.includes(entry) && !foundFiles[entry]) foundFiles[entry] = entryPath
  }

  return foundFiles
}

/**
 *
 * @param {string} filename
 * @param {string} srcPath
 * @param {string} targetDir
 */
function copyFile(filename, srcPath, targetDir) {
  mkdirRecursiveSync(targetDir)
  const targetPath = join(targetDir, filename)
  copyFileSync(srcPath, targetPath)
}

function syncFiles() {
  const foundFiles = searchFileRecursiveSync(srcDir, targetFiles)
  for (const [filename, srcPath] of Object.entries(foundFiles)) {
    copyFile(filename, srcPath, vueStaticDir)
    copyFile(filename, srcPath, reactStaticDir)
  }
}

syncFiles()

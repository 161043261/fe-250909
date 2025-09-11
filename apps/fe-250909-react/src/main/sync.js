/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync } from 'fs'
import { dirname, join, resolve } from 'path'

const targetDirPath = dirname(import.meta.url)
const srcDirPath = resolve(targetDirPath, '../../../apps/fe-250909-vue/src/main')

/**
 *
 * @param {string} dirPath
 */
function mkdirRecursiveSync(dirPath) {
  if (existsSync(dirPath)) {
    mkdirRecursiveSync(dirname(dirPath))
    mkdirSync(dirPath)
  }
}

/**
 *
 * @param {string} srcDirPath
 * @param {string} targetDirPath
 */
function copyDir(srcDirPath, targetDirPath) {
  if (!existsSync(targetDirPath)) {
    mkdirRecursiveSync(targetDirPath)
  }
  const entries = readFileSync(srcDirPath)
  for (const entry of entries) {
    const srcPath = join(srcDirPath, entry)
    const targetPath = join(targetDirPath, entry)

    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      copyDir(srcPath, targetPath)
    } else {
      if (existsSync(targetPath)) {
        unlinkSync(targetPath)
      }
      copyFileSync(srcPath, targetPath)
    }
  }
}

copyDir(srcDirPath, targetDirPath)

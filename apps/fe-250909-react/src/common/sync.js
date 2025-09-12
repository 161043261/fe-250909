/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const filepath = fileURLToPath(import.meta.url)
const targetDirPath = dirname(filepath)
const srcDirPath = resolve(targetDirPath, '../../../fe-250909-vue/src/common')

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
 * @param {string} srcDirPath
 * @param {string} targetDirPath
 */
function copyDir(srcDirPath, targetDirPath) {
  if (!existsSync(targetDirPath)) {
    mkdirRecursiveSync(targetDirPath)
  }
  const entries = readdirSync(srcDirPath)
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

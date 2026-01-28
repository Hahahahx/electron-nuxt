import type { ForgeConfig } from '@electron-forge/shared-types'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { HOMEPATH } from './file'

export default async function preBuild(
  _: ForgeConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.removeSync(path.join(HOMEPATH, '.out'))
    console.log('Prerendering Electron compiler...')

    const electronBuild = spawn('pnpm', ['tsc', '--noEmit false', '--project tsconfig.node.json'], {
      cwd: HOMEPATH,
      stdio: 'inherit',
      shell: true
    })

    console.log('Prerendering Nuxt build...')
    const nuxtBuild = spawn('pnpm', ['nuxt', 'generate'], {
      cwd: HOMEPATH,
      stdio: 'inherit',
      shell: true
    })

    nuxtBuild.on('close', async (code) => {
      console.log('Nuxt build run finished, code:' + code)
      if (code === 0) {
        console.log('Nuxt build run finished')

        const sourceDir = path.join(HOMEPATH, 'dist')
        const tempDir = path.join(HOMEPATH, '.out', 'app')

        // 确保目标目录存在
        await fs.ensureDir(tempDir)
        await fs.copy(sourceDir, tempDir, {
          overwrite: true,
          dereference: true, // 复制文件内容，而不是创建符号链接
          preserveTimestamps: true
        })

        resolve()
      } else {
        reject(new Error(`Nuxt build failed with code ${code}`))
      }
    })

    nuxtBuild.on('error', (error) => {
      console.log('Nuxt build run error')
      reject(error)
    })

    electronBuild.on('close', (code) => {
      if (code === 0) {
        console.log('Electron build run finished')
      } else {
        reject(new Error(`Electron build failed with code ${code}`))
      }
    })
  })
}

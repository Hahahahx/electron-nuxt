import type { ForgeConfig } from '@electron-forge/shared-types'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function prerenderer(
  _: ForgeConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Prerendering Electron compiler...')

    const electronBuild = spawn('pnpm', ['tsc', '--watch', '--noEmit false', '--project tsconfig.node.json'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    })

    console.log('Prerendering Nuxt application...')
    const nuxtBuild = spawn('pnpm', ['nuxt', 'dev'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    })

    nuxtBuild.on('close', (code) => {
      if (code === 0) {
        console.log('Nuxt build run finished')
        resolve()
      } else {
        reject(new Error(`Nuxt build failed with code ${code}`))
      }
    })

    nuxtBuild.on('error', (error) => {
      reject(error)
    })

    electronBuild.on('close', (code) => {
      if (code === 0) {
        console.log('Electron watch run finished')
        nuxtBuild.kill()
      } else {
        reject(new Error(`Electron watch failed with code ${code}`))
      }
    })
    resolve()
  })
}

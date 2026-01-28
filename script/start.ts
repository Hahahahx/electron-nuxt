import type { ForgeConfig } from '@electron-forge/shared-types'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { HOMEPATH } from './file'

export default async function prerenderer(
  _: ForgeConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.removeSync(path.join(HOMEPATH, '.out'))
    console.log('Prerendering Electron compiler...')

    spawn('pnpm', ['tsc', '--noEmit false', '--project tsconfig.node.json'], {
      cwd: HOMEPATH,
      stdio: 'inherit',
      shell: true
    }).on('close', (code) => {
      if (code === 0) {
        const electronBuild = spawn('pnpm', ['tsc', '--watch', '--noEmit false', '--project tsconfig.node.json'], {
          cwd: HOMEPATH,
          stdio: 'inherit',
          shell: true
        })

        console.log('Prerendering Nuxt application...')
        const nuxtBuild = spawn('pnpm', ['nuxt', 'dev'], {
          cwd: HOMEPATH,
          stdio: 'inherit',
          shell: true
        })

        nuxtBuild.on('close', (code) => {
          reject(new Error(`Nuxt build failed with code ${code}`))
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
      } else {
        reject(new Error(`Typescript compilation failed with code ${code}`))
      }
    })
  })
}

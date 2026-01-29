import type { ForgeConfig } from '@electron-forge/shared-types'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { HOMEPATH } from './file'

export default async function prerenderer(
  _: ForgeConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const electronBuild = spawn('pnpm', ['tsc', '--noEmit false', '--project tsconfig.node.json'], {
      cwd: HOMEPATH,
      stdio: 'inherit',
      shell: true
    })

    electronBuild.on('close', (code) => {
      if (code === 0) {
        console.log('Electron watch run finished')
        resolve()
      } else {
        reject(new Error(`Electron watch failed with code ${code}`))
      }
    })
  })
}

// config/forge.config.env.ts
import { resolve } from 'node:path'
import { HOMEPATH } from './file'

const iconConfig = {
  // 基础图标路径
  baseIcon: resolve(HOMEPATH, './app/assets/logo.png'),
  // 平台特定图标
  windowsIcon: resolve(HOMEPATH, './app/assets/logo/icons/win/icon.ico'),
  macIcon: resolve(HOMEPATH, './app/assets/logo/icons/mac/icon.icns')
  // linuxIcon: resolve(__dirname, '../assets/icons/icon.png'),
  // // 其他资源
  // dmgBackground: resolve(__dirname, '../assets/icons/dmg-background.png'),
  // loadingGif: resolve(__dirname, '../assets/icons/loading.gif'),
}

export {
  iconConfig
}

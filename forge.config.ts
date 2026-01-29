import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerDMG } from '@electron-forge/maker-dmg' // 添加 DMG 支持
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import { iconConfig } from './electron/config/icons'
import packageJson from './package.json' // 导入 package.json
import preStart from './script/start'
import preStartStatic from './script/start-static'
import preBuild from './script/build'

const productName = packageJson.productName.replace(/\s+/g, '-')

const config: ForgeConfig = {
  packagerConfig: {
    name: productName,
    executableName: productName,
    asar: true,
    extraResource: [
      './.out/app'
    ],
    ignore: [
      '.output', 'dist', '.nuxt', '.git', '.vscode'
    ]
  },
  hooks: {
    preStart: preStart,
    prePackage: async (config) => {
      await preBuild(config)
    },
    preMake: async (config) => {
      await preBuild(config)
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: iconConfig.windowsIcon,
      setupExe: `${productName}-Setup-${packageJson.version}.exe`, // 带版本号的安装程序
      authors: packageJson.author.name, // 作者
      description: packageJson.description, // 描述
      version: packageJson.version // 版本
      // iconUrl: 'https://example.com/icon.ico', // 可选：远程图标URL
      // loadingGif: resolve(__dirname, 'assets/icons/loading.gif'), // 安装时的加载动画
    }),
    new MakerZIP({}, ['darwin']),

    // macOS - DMG
    new MakerDMG({
      icon: iconConfig.macIcon,
      // background: resolve(__dirname, 'assets/icons/dmg-background.png'),
      name: productName,
      overwrite: true,
      additionalDMGOptions: {
        window: {
          size: {
            width: 660,
            height: 400
          }
        }
      }
    })
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
}

export default config

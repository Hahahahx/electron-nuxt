const path = require('node:path')
const { generateIcons } = require('electron-icon-builder')

generateIcons({
  // 输入图片（1024x1024 PNG 最佳）
  inputFilePath: path.resolve(__dirname, '../app/assets/logo.png'),
  // 输出目录
  outputDirectory: path.resolve(__dirname, '../assets/icons'),
  // 平台配置
  platforms: ['win', 'mac', 'linux'],
  // 图标名称
  names: {
    win: 'icon',
    mac: 'icon',
    linux: 'icon',
  },
}).then(() => {
  console.log('Icons generated successfully!')
}).catch((err) => {
  console.error('Error generating icons:', err)
})

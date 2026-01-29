import path from 'node:path'
import process from 'node:process'
import { app, BrowserWindow, nativeImage } from 'electron'
import started from 'electron-squirrel-startup'
import { iconConfig } from './config/icons'
import { HOMEPATH } from './config/file'
import serve from './plugins/serve'

// 根据环境确定正确的资源路径
const getResourcesPath = (): string => {
  if (app.isPackaged) {
    // 打包后，静态文件位于 resources 目录中
    return path.join(process.resourcesPath, 'app')
  } else {
    // 开发环境中，使用项目根目录下的 .out/app
    return path.join(HOMEPATH, '../app')
  }
}

const loadUrl = serve({ directory: getResourcesPath() })

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
const isDev = process.env.NODE_ENV === 'development'

async function createWindow() {
  const iconPath = iconConfig.baseIcon
  const icon = nativeImage.createFromPath(iconPath)

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 580,
    minWidth: 780,
    transparent: false,
    titleBarStyle: 'hiddenInset',
    frame: false,
    icon, // 设置窗口图标
    webPreferences: {
      experimentalFeatures: true,
      preload: path.join(HOMEPATH, 'preload.js')
    }
  })

  console.log('process.env.NODE_ENV ', isDev)

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    await loadUrl(mainWindow)
  // mainWindow.loadFile(
  //   path.join(HOMEPATH, `../app/index.html`)
  // )
  }
  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // 注册 file 协议处理器

  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

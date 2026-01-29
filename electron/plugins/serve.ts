import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import electron from 'electron'

// Electron 要求在应用就绪之前只调用一次 `registerSchemesAsPrivileged`。我们使用 `queueMicrotask` 将来自同步 `serve()` 调用的所有方案批量注册到单个注册中。
const pendingSchemes: any[] = []
let schemesRegistered = false

/**
 * 向应用程序注册 Electron 自定义协议
 * @param scheme - 要注册的协议配置对象
 * @throws 如果尝试在应用就绪后注册协议时抛出错误
 */
const registerScheme = (scheme: any) => {
  if (schemesRegistered) {
    throw new Error('electron-serve: 无法在应用就绪后注册新协议。请确保在 app.whenReady() 之前调用 serve()。')
  }

  pendingSchemes.push(scheme)

  if (pendingSchemes.length === 1) {
    queueMicrotask(() => {
      schemesRegistered = true
      electron.protocol.registerSchemesAsPrivileged(pendingSchemes)
    })
  }
}

/**
 * 获取适当的文件路径，处理文件和目录
 * @param path_ - 要检查的基路径
 * @param file - 可选的附加文件名，当路径为目录时使用
 * @returns 解析后的文件路径或未找到时返回 undefined
 */
const getPath = async (path_: string, file?: string) => {
  try {
    const result = await fs.stat(path_)

    if (result.isFile()) {
      return path_
    }

    if (result.isDirectory()) {
      return getPath(path.join(path_, `${file}.html`))
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * 创建一个 Electron 协议处理器，用于通过自定义协议提供本地文件服务
 * @param options - 协议处理器的配置选项
 * @param options.isCorsEnabled - 是否为协议启用跨域资源共享（默认值：true）
 * @param options.scheme - 自定义协议名称（默认值：'app'）
 * @param options.hostname - 协议的主机名（默认值：'-'）
 * @param options.file - 默认文件名（默认值：'index'）
 * @param options.directory - 提供文件服务的目录（默认值：'.'）
 * @param options.partition - 使用的会话分区（可选）
 * @returns 异步函数，用于在 BrowserWindow 实例中加载 URL
 */
export default function electronServe(options: any = {}) {
  options = {
    isCorsEnabled: true,
    scheme: 'app',
    hostname: '-',
    file: 'index',
    directory: '.',
    ...options
  }

  options.directory = path.resolve(electron.app.getAppPath(), options.directory)

  const handler = async (request: any) => {
    const indexPath = path.join(options.directory, `${options.file}.html`)
    const filePath = path.join(options.directory, decodeURIComponent(new URL(request.url).pathname))

    const relativePath = path.relative(options.directory, filePath)
    const isSafe = !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

    if (!isSafe) {
      return new Response(null, { status: 404, statusText: '未找到' })
    }

    const finalPath = await getPath(filePath, options.file)
    const fileExtension = path.extname(filePath)

    if (!finalPath && fileExtension && fileExtension !== '.html' && fileExtension !== '.asar') {
      return new Response(null, { status: 404, statusText: '未找到' })
    }

    const fileUrl = pathToFileURL(finalPath || indexPath)
    const response = await electron.net.fetch(fileUrl.toString())

    // 修复源映射文件的 MIME 类型以启用 DevTools 支持
    if ((finalPath || indexPath).endsWith('.map')) {
      const body = await response.arrayBuffer()
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'content-type': 'application/json'
        }
      })
    }

    return response
  }

  registerScheme({
    scheme: options.scheme,
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: options.isCorsEnabled,
      stream: true,
      codeCache: true
    }
  })

  electron.app.on('ready', () => {
    const session = options.partition
      ? electron.session.fromPartition(options.partition)
      : electron.session.defaultSession

    session.protocol.handle(options.scheme, handler)
  })

  /**
   * 在提供的 BrowserWindow 中使用自定义协议加载 URL
   * @param window_ - 要在其内加载 URL 的 BrowserWindow 实例
   * @param searchParameters - 要附加到 URL 的可选查询参数
   * @returns 当 URL 加载完成时解析的 Promise
   */
  return async (window_: any, searchParameters: any = {}) => {
    const queryString = searchParameters ? '?' + new URLSearchParams(searchParameters).toString() : ''
    await window_.loadURL(`${options.scheme}://${options.hostname}${queryString}`)
  }
}

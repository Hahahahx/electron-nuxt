// config/forge.config.env.ts
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
export const HOMEPATH = resolve(dirname(__filename), '..')

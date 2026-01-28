import path from 'path'
import { mkdirSync } from 'fs'
import fs from 'fs-extra'
import { __dirname } from '../config/file'

const sourceDir = path.join(__dirname, 'dist')
const tempDir = path.join(__dirname, '.out', 'app')

// 确保目标目录存在
if (!fs.pathExists(tempDir)) {
  await mkdirSync(tempDir, { recursive: true })
}

// 复制文件，而不是创建符号链接
await fs.copy(sourceDir, tempDir, {

  overwrite: true,
  dereference: true, // 复制文件内容，而不是创建符号链接
  preserveTimestamps: true
})
//

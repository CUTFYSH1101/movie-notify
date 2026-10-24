import { createRequire } from 'node:module'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { mapConfig } from './taiwan-map.config.js'
import { buildTaiwanMap } from './taiwan-map-method.js'

const require = createRequire(import.meta.url)

// 1. 找到 taiwan-atlas 提供的縣市地圖資料
// T:\Programing_RightPath\ispan\movie-notify-googlemap\node_modules\taiwan-atlas\counties-10t.json
const atlasPath = require.resolve(  // 路徑
  'taiwan-atlas/counties-10t.json'
)
export const topology = JSON.parse(
  await readFile(atlasPath, 'utf8')
)

// 2. 建立地圖資料
const mapData = buildTaiwanMap(topology, mapConfig)

// 3. 輸出到 Vue 可以讀取的 JSON 檔案
const outputPath = resolve(
  'src/assets/taiwan-map.json'
)

// mkdir
// recursive: true 如果已經有路徑就不報錯
await mkdir(dirname(outputPath), {
  recursive: true,
})

await writeFile(
  outputPath,
  JSON.stringify(mapData, null, 2),
  'utf8'
)

console.log(`成功產生台灣地圖：${outputPath}`)
console.log(`縣市數量：${mapData.pieces.length}`)
console.log(`畫布大小：${mapData.width} × ${mapData.height}`)

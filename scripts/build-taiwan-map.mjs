import { createRequire } from 'node:module'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { geoMercator, geoPath } from 'd3-geo'
// feature：把 TopoJSON 轉成 GeoJSON
// merge：把多個 geometry 合併成一塊（去掉內部共用邊界）
import { feature, merge } from 'topojson-client'

const require = createRequire(import.meta.url)

// 1. 找到 taiwan-atlas 提供的縣市地圖資料
// T:\Programing_RightPath\ispan\movie-notify-googlemap\node_modules\taiwan-atlas\counties-10t.json
const atlasPath = require.resolve(  // 路徑
    'taiwan-atlas/counties-10t.json'
)
export const topology = JSON.parse(  // 縣市地圖資料
    await readFile(atlasPath, 'utf8')
)

// console.log('topology', topology)
// console.log('topology', JSON.stringify(topology, null, 2))

// 2. 將 TopoJSON 轉成 GeoJSON
const cities = feature(
    topology,
    topology.objects.counties
)
console.log('cities', cities)

// 3. 設定 SVG 畫布大小
const width = 640
const height = 900
const padding = 20

// 要隱藏、不顯示在地圖上的縣市（連江縣＝馬祖，離本島太遠）
const hiddenCities = new Set(['連江縣'])

// 投影時只納入「要顯示」的縣市範圍（排除連江），
// 否則為了容納最北的馬祖，本島會被往下擠、上方留一大塊空白
const visibleFeatures = {
    type: 'FeatureCollection',
    features: cities.features.filter(
        city => !hiddenCities.has(city.properties.COUNTYNAME)
    ),
}

// 4. 計算地圖投影，讓台灣縣市放進畫布
// geoMercator() 建立 Mercator（麥卡托）地圖投影
// .fitExtent() 自動調整地圖的縮放比例與位置，讓指定的地理資料完整放進指定的畫布範圍內
// projection 負責把經緯度轉換成 SVG 平面座標
const projection = geoMercator().fitExtent(
    [
        [padding, padding],
        [width - padding, height - padding],
    ],
    visibleFeatures
)

// 5. 建立 SVG 路徑產生器
// geoPath() 將 GeoJSON 地理資料轉換成 SVG 路徑
// .digits(0) 小數點後保留 0 位數
const path = geoPath(projection).digits(0)


// 定義要合併的縣市群組
// 注意：cities 內的名稱必須和原始資料的 COUNTYNAME 完全一致
// taiwan-atlas 使用的是俗字「台北市」（不是正體「臺北市」），否則比對不到、合併會失敗
const mergeGroups = [
    { cities: ['嘉義縣', '嘉義市'], label: '嘉義', },
    { cities: ['新竹縣', '新竹市'], label: '新竹', },
    { cities: ['台北市', '新北市'], label: '雙北', },
]
const mergedCityNames = new Set(
    mergeGroups.flatMap(group => group.cities)
)
console.log('mergedGroups', mergeGroups)
console.log('mergedCityNames', mergedCityNames)

// 把名稱結尾的「縣」或「市」去掉，用於地圖上的顯示文字
// 例如「台中市」→「台中」、「宜蘭縣」→「宜蘭」；合併後的「嘉義」「雙北」沒有尾字，不受影響
const stripSuffix = (name) => name.replace(/[縣市]$/, '')

// 離島平移量 [dx, dy]（SVG 像素）：把金門、澎湖往本島方向拉近，縮短中間的海洋空白
// 正的 dx 往右（東）、正的 dy 往下（南）
const islandOffsets = {
    金門縣: [165, 120],
    澎湖縣: [30, 10],
}
// 查某縣市的平移量，沒有設定就回傳 [0, 0]（不平移）
const offsetOf = (name) => islandOffsets[name] ?? [0, 0]

// 6. 產生每個縣市的路徑、中心點及外框
// 遍歷每個縣市的地理資料，整理出繪製地圖所需要的資訊
const pieces = cities.features
    .filter(city => !mergedCityNames.has(city.properties.COUNTYNAME))
    .filter(city => !hiddenCities.has(city.properties.COUNTYNAME))  // 排除要隱藏的縣市（連江）
    .map((city) => ({
        city: city.properties.COUNTYNAME,  // "臺中市" 原始全名，當作唯一 key
        shortName: stripSuffix(city.properties.COUNTYNAME),  // "臺中" 去掉縣市字，地圖顯示用
        cityEn: city.properties.COUNTYENG,  // "Taichung City"
        d: path(city),  // "M120,80L150,90L..." SVG path 路徑字串
        centroid: path.centroid(city),  // [320, 240] 計算該縣市地理形狀的幾何中心點，回傳一組 [x, y] 座標，用來放置縣市名稱
        bounds: path.bounds(city),  // [[minX, minY], [maxX, maxY]] 邊界左上角右下角座標
        translate: offsetOf(city.properties.COUNTYNAME),  // [dx, dy] 離島平移量，一般縣市為 [0, 0]
    }))
console.log('COUNTYNAME', cities.features[0].properties.COUNTYNAME)
console.log('COUNTYENG', cities.features[0].properties.COUNTYENG)

// 取得 TopoJSON 裡所有縣市的 geometry 物件
// merge() 需要的是 topology 內的 geometry，而不是前面轉好的 GeoJSON feature
const geometries = topology.objects.counties.geometries

// 逐一處理每個合併群組，把多個縣市合併成一塊後加進 pieces
for (const group of mergeGroups) {
    // 找出屬於這個群組的 geometry（例如「嘉義縣」「嘉義市」）
    const matched = geometries.filter(geometry =>
        group.cities.includes(geometry.properties.COUNTYNAME)
    )

    // merge() 把這些 geometry 合併成一個 GeoJSON，內部交界會被去除
    const mergedGeometry = merge(topology, matched)

    // 把合併結果加進 pieces，名稱用群組的 label（例如「嘉義」「雙北」）
    pieces.push({
        city: group.label,          // "嘉義"
        shortName: stripSuffix(group.label),  // 顯示用名稱（label 本身已無縣市字）
        cityEn: '',                 // 合併區塊沒有對應的英文名
        cities: group.cities,       // 記錄這塊是由哪些縣市合併而成
        d: path(mergedGeometry),    // SVG path 路徑字串
        centroid: path.centroid(mergedGeometry),  // 中心點座標，用來放名稱
        bounds: path.bounds(mergedGeometry),       // 邊界座標
        translate: [0, 0],                         // 合併區塊都在本島，不需平移
    })
}

// 7. 輸出到 Vue 可以讀取的 JSON 檔案
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
    JSON.stringify(
        { width, height, pieces },
        null,
        2
    ),
    'utf8'
)
console.log(`成功產生台灣地圖：${outputPath}`)
console.log(`縣市數量：${pieces.length}`)
console.log(`畫布大小：${width} × ${height}`)
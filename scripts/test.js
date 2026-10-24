// noinspection NonAsciiCharacters

import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { feature } from 'topojson-client'
import { geoMercator, geoPath } from 'd3-geo'

import { mapConfig } from './taiwan-map.config.js'

const require = createRequire(import.meta.url)

const atlasPath = require.resolve(
  'taiwan-atlas/counties-10t.json'
)
export const topology = JSON.parse(
  await readFile(atlasPath, 'utf8')
)

// feature() 套用 translate 將量化值轉為經緯度
// topology.objects.counties.geometries[i].arcs --> cities.features[i].geometry.coordinates
const counties = topology.objects.counties
const cities = feature(
  topology,
  counties
)
console.log(Object.keys(counties))      // [ 'type', 'geometries' ]
console.log(Object.keys(cities))        // [ 'type', 'features' ]
console.log(counties.type)              // GeometryCollection
console.log(cities.type)                // FeatureCollection
console.log(counties.geometries.length) // 22
console.log(cities.features.length)     // 同上
console.log(Object.keys(counties.geometries[0]))      // [ 'type', 'properties', 'arcs' ]
console.log(Object.keys(cities.features[0]))          // [ 'type', 'properties', 'geometry' ]
console.log(counties.geometries[0].type)              // MultiPolygon
console.log(cities.features[0].type)                  // Feature
// console.log(counties.geometries[0].properties)        // { COUNTYNAME: '連江縣', COUNTYENG: 'Lienchiang County' }
// console.log(cities.features[0].properties)            // 同上
console.log(counties.geometries[0].arcs.length)       // 11
console.log(counties.geometries[0].arcs[0].length)    // 1
console.log(counties.geometries[0].type)              // MultiPolygon
console.log(counties.geometries[0].arcs)              // [ [[0]],[[1]],...,[[10]] ] 有11個多邊形，每個獨立，這裡的arcs是索引值※
console.log(counties.geometries[1].type)              // MultiPolygon
console.log(counties.geometries[1].arcs)              // [ [[11]], [[12,13,14,15,16,17]] ] 有2個多邊形，第一個多邊形用1個arc，第二個多邊形用6個arc拼成
// region 連江縣 cities.features[0]
console.log('======【連江縣 cities.features[0]】======')
const 連江縣 = cities.features[0]
console.log(連江縣.properties.COUNTYNAME)              // 連江縣
console.log(Object.keys(連江縣.geometry))              // [ 'type', 'coordinates' ]
console.log(連江縣.type)                               // Feature
console.log(連江縣.geometry.type)                      // MultiPolygon
const 連江縣經緯度 = 連江縣.geometry.coordinates
console.log(連江縣經緯度.length)                        // 11
console.log(連江縣經緯度[0].length)                     // 1
console.log(連江縣經緯度[0][0].length)                  // 62
console.log(連江縣經緯度[0][0][0].length)               // 2
console.log(連江縣經緯度[0][0][0])                      // [ 119.98482238616963, 25.970585207990922 ]
console.log('=====================================')
// endregion
// region 宜蘭縣 cities.features[1]
console.log('======【宜蘭縣 cities.features[1]】======')
const 宜蘭縣 = cities.features[1]
console.log(宜蘭縣.properties.COUNTYNAME)              // 宜蘭縣
console.log(宜蘭縣.type)                               // Feature
console.log(Object.keys(宜蘭縣.geometry))              // [ 'type', 'coordinates' ]
console.log(宜蘭縣.geometry.type)                      // MultiPolygon
const 宜蘭縣經緯度 = 宜蘭縣.geometry.coordinates
console.log(宜蘭縣經緯度.length)                        // 2
console.log(宜蘭縣經緯度[0].length)                     // 1
console.log(宜蘭縣經緯度[1].length)                     // 1
console.log(宜蘭縣經緯度[0][0].length)                  // 35
console.log(宜蘭縣經緯度[1][0].length)                  // 1140
console.log(宜蘭縣經緯度[0][0][0].length)               // 2
console.log(宜蘭縣經緯度[1][0][0].length)               // 2
console.log(宜蘭縣經緯度[0][0][0])                      // [ 121.95971032387125, 24.844937102044245 ]
console.log(宜蘭縣經緯度[1][0][0])                      // [ 121.96603097657633, 24.983076442585777 ]
// 結論宜蘭縣經緯度形狀為 2 x 1 x [35,1140] x 2
console.log('=====================================')
// endregion

// region projection geoMercator().fitExtent()
// const [x, y] = projection([lng, lat])  // 經過 d3-geo 投影後
const { width, height, padding } = mapConfig.canvas

const projection = geoMercator().fitExtent(
  [
    [padding, padding],                  // 左上角座標
    [width - padding, height - padding], // 右下角座標
  ],
  cities.features
)
console.log('======【projection geoMercator().fitExtent()】======')
console.log(Object.keys(projection))
/*
[
  'stream', 'preclip',
  'postclip', 'clipAngle',
  'clipExtent', 'scale',
  'translate', 'center',
  'rotate', 'angle',
  'reflectX', 'reflectY',
  'precision', 'fitExtent',
  'fitSize', 'fitWidth',
  'fitHeight', 'invert'
]
*/
console.log('=====================================')
// endregion

// region geoPath()
const path = geoPath(projection).digits(0)
console.log('======【geoPath()】======')
console.log(Object.keys(path))
/*
path 本身是物件也是方法
當方法時要傳入 cities.features[i] 回傳 SVG path
[
  'area',
  'measure',
  'bounds',
  'centroid',
  'projection',
  'context',
  'pointRadius',
  'digits'
]
*/

console.log('=====================================')
// endregion

// region 合併 counties.features 和 path 資料
const pieces = counties.features.map((county) => ({
  city: county.properties.COUNTYNAME,   // "台中市"
  cityEn: county.properties.COUNTYENG,  // "Taichung City"
  d: path(county),                      // "M120,80L150,90L..." SVG path 路徑字串
  centroid: path.centroid(county),      // [320, 240] 計算該縣市地理形狀的幾何中心點，回傳一組 [x, y] 座標，用來放置縣市名稱
  bounds: path.bounds(county),          // [[minX, minY], [maxX, maxY]] 邊界左上角右下角座標
}))
// endregion

// region topology
console.log('======【topology】======')
// objects	 存放地理物件，例如縣市集合 counties、全台外框 nation
// arcs    	 存放組成地圖邊界的弧線資料
// transform 把 arcs 的值透過縮放+平移 才是真正地圖上的經緯度
// 實際經度 = arcs某一點X值 × scale[0] + translate[0]
console.log(Object.keys(topology))          // [ 'type', 'arcs', 'transform', 'objects' ]
console.log(topology.type)                  // 資料格式，通常是 'Topology'
// console.log(topology.arcs)                  // 讓後面的 geometries[0].arcs 索引回來找資料
console.log(Object.keys(topology.objects))  // [ 'counties', 'nation' ]
console.log('=====================================')
// endregion

// region topology.objects.counties
console.log('======【topology.objects.counties】======')
// type: 'GeometryCollection'
// geometries: [
//   { arcs: [Array], type: 'MultiPolygon', properties: [Object] },
//   ...
// ]
console.log(Object.keys(topology.objects.counties)) // [ 'type', 'geometries' ]
console.log(topology.objects.counties.type)         // GeometryCollection
console.log('=====================================')
// endregion

// region topology.objects.nation
console.log('======【topology.objects.nation】======')
// {
//   type: 'GeometryCollection',
//   geometries: [ { arcs: [Array], type: 'MultiPolygon', properties: [Object] } ]
// }
console.log(Object.keys(topology.objects.nation))   // [ 'type', 'geometries' ]
console.log(topology.objects.nation.type)           // GeometryCollection
console.log('=====================================')
// endregion

// region geometries
console.log('======【geometries】======')
// arcs: [ [弧線索引],... ]
// type: 'MultiPolygon'
// properties: { COUNTYNAME: '連江縣' }
const geometry = topology.objects.counties.geometries[0]  // 原始 TopoJSON
console.log(Object.keys(geometry))                        // [ 'arcs', 'type', 'properties' ]

// arcs: [[弧線索引],...]
// ※弧線，非貝茲曲線，由一連串座標點組成的線段
// 需要搭配 topology.arcs，呼叫 feature() 進行轉換時
// 由 topojson-client 自動讀取並解碼為 geometry.coordinates 經緯度
// feature() 會自動讀取 topology.transform，將量化座標還原成實際經緯度
// 實際經度 = arcs某一點X值 × scale[0] + translate[0]
// 實際緯度 = arcs某一點Y值 × scale[1] + translate[1]

// type: 'MultiPolygon'
// 單一圖形類型，例如 一個多邊形'Polygon' 或 多個多邊形'MultiPolygon'
console.log(geometry.type)          // MultiPolygon

// properties: { COUNTYNAME: '連江縣' }
console.log(geometry.properties)    // { COUNTYNAME: '連江縣', COUNTYENG: 'Lienchiang County' }
console.log('=====================================')
// endregion
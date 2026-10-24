import { geoMercator, geoPath } from 'd3-geo'
import { feature, merge } from 'topojson-client'
// feature：把 TopoJSON 轉成 GeoJSON
// merge：把多個 geometry 合併成一塊（去掉內部共用邊界）

// 正則，'縣'或'市' 取代成 ''
// 把名稱結尾的「縣」或「市」去掉，用於地圖上的顯示文字
// 例如「台中市」→「台中」、「宜蘭縣」→「宜蘭」；合併後的「嘉義」「雙北」沒有尾字，不受影響
const stripSuffix = name => name.replace(/[縣市]$/, '')

// 取得自定義 偏移量 和 縮放比例
// 離島平移量 [dx, dy]（SVG 像素）：把金門、澎湖往本島方向拉近，縮短中間的海洋空白
// 正的 dx 往右（東）、正的 dy 往下（南）
function getIslandOptions(name, config) {
  const island = name ? config.islands[name] : undefined

  // 查某縣市的平移量，沒有設定就回傳 [0, 0]（不平移）
  return {
    translate: island?.offset ?? [0, 0],
    scale: island?.scale ?? 1,
  }
}

// 保留金門縣中，經度小於 kinmen.maxLongitude 的多邊形
// 用 cities 這種已經算回原本經緯度的來篩選
// 而不是 topology.objects.counties.geometries[i].arcs
// 金門縣在資料裡含有「烏坵」(lng≈119.45, lat≈24.98) 這兩塊外島，
// 行政上屬金門、地理上卻遠在東北方。留著它會把金門的 bounds／centroid 拉歪，
// 這裡把經度明顯偏離金門本島(lng < 119)的多邊形濾掉，只保留金門本島群。
// 重新賦值 cities.features[i].geometry.coordinates
function filterKinmen(cities, config) {
  if (!config.kinmen.enabled) return  // taiwan-map.config.js 可以控制要不要打開這個功能

  // kinmen = cities.features[i]
  const kinmen = cities.features.find(
    city => city.properties.COUNTYNAME === '金門縣'
  )

  // 如果 找不到金門縣 或 金門縣圖形不是多邊形，則報錯
  if (!kinmen || kinmen.geometry.type !== 'MultiPolygon') {
    throw new Error('找不到金門縣，或金門縣不是 MultiPolygon')
  }

  kinmen.geometry.coordinates =
    kinmen.geometry.coordinates.filter(polygon => {
      // 展開最外層 3D變2D 陣列
      const points = polygon.flat(1)
      // p[0] 相當於經度 也就是x座標
      // p[1] 相當於緯度 也就是y座標
      const maxLongitude = Math.max(...points.map(p => p[0]))

      return maxLongitude < config.kinmen.maxLongitude
    })
}

// 將 GeoJSON geometry 整理成地圖區塊
function createPiece(geometry, path, config, pieceData) {
  const name = geometry.properties?.COUNTYNAME
  const city = pieceData?.city ?? name
  const shortName = pieceData?.shortName ?? stripSuffix(name)
  const cityEn = pieceData?.cityEn ?? geometry.properties?.COUNTYENG
  const cities = pieceData?.cities
  const { translate, scale } = getIslandOptions(name, config)

  return {
    city: city,                         // "台中市" 原始全名，當作 key
    shortName: shortName,               // "台中" 去掉縣市字，地圖顯示用
    cityEn: cityEn,                     // "Taichung City"
    cities: cities,                     // 記錄這塊是由哪些縣市合併而成
    d: path(geometry),                  // "M120,80L150,90L..." SVG path 路徑字串
    centroid: path.centroid(geometry),  // [320, 240] 計算該縣市地理形狀的幾何中心點，回傳一組 [x, y] 座標，用來放置縣市名稱
    bounds: path.bounds(geometry),      // [[minX, minY], [maxX, maxY]] 邊界左上角右下角座標
    translate,                          // 自定義的 [dx, dy] 離島平移量，一般縣市為 [0, 0]
    scale,
    geometry,
  }
}

// 將 createPiece() 的回傳值轉成最終地圖資料
function transformPiece(piece, projection, path) {
  const {
    geometry,
    centroid: [cx, cy], // 這塊在螢幕上的中心，當作縮放圓心
    translate = [0, 0],
    scale = 1,
    ...pieceData
  } = piece
  const [dx, dy] = translate                // 離島往本島推的平移量，一般縣市為 [0, 0]
  const originalScale = projection.scale()
  const [tx, ty] = projection.translate()

  try {
    // 想要的效果：以 centroid 為圓心放大 scale 倍，再平移 [dx, dy]
    //   p' = 圓心 + scale × (p − 圓心) + 平移
    // 但 d3 的 .scale() 是繞投影原點縮放，不是繞 centroid。
    // 解法：把上面這個變換直接套在投影的錨點 translate (tx, ty) 上，
    // 算出新的 translate，等效於「繞 centroid 縮放後再平移」。
    projection
      .scale(originalScale * scale)
      .translate([
        cx + scale * (tx - cx) + dx,
        cy + scale * (ty - cy) + dy,
      ])
    const piecePath = geoPath(projection).digits(0)

    return {
      ...pieceData,
      d: piecePath(geometry),
      centroid: piecePath.centroid(geometry),
      bounds: piecePath.bounds(geometry),
    }
  } finally {
    projection.scale(originalScale).translate([tx, ty])
  }
}

// 統一將所有原始區塊轉成最終地圖資料
function transformPieces(pieces, projection, path) {
  return pieces.map(piece => transformPiece(piece, projection, path))
}

// 合併指定縣市
function createMergedPiece(topology, path, config, group) {
  // geometries 是從 'taiwan-atlas/counties-10t.json' 載入
  // merge() 需要的資料格式 TopoJSON topology 物件 而不是之前轉好的 GeoJSON
  // 它會依照 arcs 合併邊界並回傳 GeoJSON MultiPolygon，所以不能直接把 GeoJSON feature 傳進去
  // console.log(topology.type) // 資料格式，通常是 'Topology'
  const geometries = topology.objects.counties.geometries
  // 找出屬於這個群組的 geometry（例如「嘉義縣」「嘉義市」）
  const matched = geometries.filter(geometry =>
    group.cities.includes(geometry.properties.COUNTYNAME)
  )

  // region （可選）
  // 避免縣市名稱拼錯，導致合併結果不完整
  // 逐一讀取 COUNTYNAME 並去重複
  const matchedNames = new Set(
    matched.map(geometry => geometry.properties.COUNTYNAME)
  )

  // 確認群組指定的每個縣市都能在 TopoJSON 資料中找到；缺少就終止程式
  const missing = group.cities.filter(name => !matchedNames.has(name))

  if (missing.length > 0) {
    throw new Error(
      `合併群組「${group.shortName}」找不到縣市：${missing.join('、')}`
    )
  }
  // endregion

  // merge() 把這些 geometry 合併成一個 GeoJSON，內部交界會被去除
  // geometry => 合併後的縣市
  const geometry = merge(topology, matched)

  // region （可選）合併後縣市名稱也要合併
  const city = group.cities.join('、')
  const cityEn = matched
    .map(geometry => geometry.properties.COUNTYENG)
    .join(', ')
  // endregion

  // city 記錄組成合併區塊的縣市全名；shortName 使用群組設定的地圖顯示名稱
  return createPiece(geometry, path, config, {
    city,
    shortName: group.shortName,
    cityEn,
    cities: group.cities,
  })
}

// 合併指定縣市
function createMergedPieces(topology, path, config) {
  return config.mergeGroups.map(group =>
    createMergedPiece(topology, path, config, group)
  )
}

export function buildTaiwanMap(topology, config) {
  // 1. TopoJSON → GeoJSON
  const counties = topology.objects.counties
  const cities = feature(
    topology,
    counties
  )
  // JSON.stringify(, null, 縮排)
  console.log('counties', counties)
  console.log('counties', JSON.stringify(counties, null, 2))
  console.log('cities', cities)

  // 2. 在投影前處理金門幾何資料
  // 重新賦值 cities.features[i].geometry.coordinates
  filterKinmen(cities, config)

  // 3. 排除隱藏縣市，決定投影範圍（連江縣＝馬祖，離台灣本島太遠）
  const hiddenCities = new Set(config.hiddenCities)

  // 投影時只納入「要顯示」的縣市範圍（排除連江），
  // 否則為了容納最北的馬祖，本島會被往下擠、上方留一大塊空白
  const visibleFeatures = {
    type: 'FeatureCollection',
    features: cities.features.filter(
      city => !hiddenCities.has(city.properties.COUNTYNAME)
    ),
  }

  // 4. 建立投影與路徑產生器
  // 計算地圖投影後的縮放比例與位置，
  // 讓台灣縣市的地理資料剛好放進指定的畫布範圍內
  // geoMercator() 建立 Mercator（麥卡托）地圖投影
  // .fitExtent() 自動調整地圖的縮放比例與位置，
  // 讓指定的地理資料完整放進指定的畫布範圍內
  // projection 負責把經緯度轉換成 SVG 平面座標
  const { width, height, padding } = config.canvas

  const projection = geoMercator().fitExtent(
    [
      [padding, padding],                  // 左上角座標
      [width - padding, height - padding], // 右下角座標
    ],
    visibleFeatures
  )

  // 5. 建立 SVG 路徑產生器
  // geoPath() 將 GeoJSON 地理資料轉換成 SVG 路徑
  // .digits(0) 小數點後保留 0 位數
  const path = geoPath(projection).digits(0)

  // 5. 一般縣市：排除要合併或隱藏的縣市
  const mergedNames = new Set(
    config.mergeGroups.flatMap(group => group.cities)
  )

  const pieces = visibleFeatures.features
    .filter(city =>
      !mergedNames.has(city.properties.COUNTYNAME)
    )
    .map(city => createPiece(city, path, config))

  // 6. 加入合併後的縣市
  // createMergedPieces 合併的縣市改從一開始載入的原始 TopoJSON 取 geometry 另外處理，
  // 不使用前面轉成 GeoJSON 並整理過的 cities
  pieces.push(...createMergedPieces(topology, path, config))

  // 7. 統一套用平移與縮放，產生最終地圖資料
  const transformedPieces = transformPieces(pieces, projection, path)

  return {
    width,
    height,
    pieces: transformedPieces,
  }
}

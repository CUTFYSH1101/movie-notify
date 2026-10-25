export const mapConfig = {
  canvas: {
    width: 640,
    height: 900,
    padding: 20,
  },

  // 不顯示的縣市
  hiddenCities: ['連江縣'],

  // 要合併的縣市群組
  // 注意：cities 內的名稱必須和原始資料的 COUNTYNAME 完全一致
  // taiwan-atlas 使用的是「台北市」不是「臺北市」，否則比對不到、合併會失敗
  mergeGroups: [
    { cities: ['嘉義縣', '嘉義市'], shortName: '嘉義' },
    { cities: ['新竹縣', '新竹市'], shortName: '新竹' },
    { cities: ['台北市', '新北市'], shortName: '雙北' },
  ],

  // 排除金門縣內的烏坵多邊形
  kinmen: {
    enabled: true,
    maxLongitude: 119,
  },

  // 離島的 SVG 平移量與縮放比例
  islands: {
    '金門縣': { offset: [200, -50], scale: 1.8 },
    '澎湖縣': { offset: [0, 10], scale: 2.2 },
  },
}

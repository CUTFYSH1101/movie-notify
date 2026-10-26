// ※AI 縣市的顯示順序（北到南、離島最後）
export const CITY_ORDER = [
  '基隆', '雙北', '桃園', '新竹', '苗栗',
  '台中', '彰化', '南投', '雲林',
  '嘉義', '台南', '高雄', '屏東',
  '宜蘭', '花蓮', '台東',
  '連江', '金門', '澎湖',
] as const

const orderIndex = new Map<string, number>(CITY_ORDER.map((city, i) => [city, i]))

export function cityRank(city: string): number {
  return orderIndex.get(city) ?? Infinity   // 不在清單裡的排最後
}
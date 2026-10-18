import { r2src } from '@/js/movieRatingSystem.ts'
import { reactive, ref } from 'vue'
import { API } from '@shared/paths.ts';

export interface Option {
  value: string
  label: string
  img?: string
}

export const theaters = [
  { value: '', label: '不限' },
  { value: 't02a11', label: 'MUVIE CINEMAS台北松仁威秀' },
  { value: 't02a01', label: '台北信義威秀' },
  { value: 't02a13', label: '大巨蛋秀泰影城' },
  { value: 't04405', label: '親親戲院' },
]
export const ratings = [
  { value: '', label: '不限' },
  { value: '普遍級', label: '普遍級', img: r2src('普遍級') },
  { value: '保護級', label: '保護級', img: r2src('保護級') },
  { value: '輔12級', label: '輔12級', img: r2src('輔12級') },
  { value: '輔15級', label: '輔15級', img: r2src('輔15級') },
  { value: '限制級', label: '限制級', img: r2src('限制級') },
]
// region 載入日期與版本選單陣列，每個元素都是 Option 字典
// Option 屬性：value、label、img（選填）
// 呼叫 fetchVersionsOrDates 時，第一個元素固定為 { value: '', label: '不限' }，其餘由伺服器 API 載入
// 例如 dates：
// [
//   { value: '', label: '不限' },                            <== 預設選項
//   { value: '2026/09/29 (二)', label: '2026/09/29 (二)' },  <== 伺服器載入
//   { value: '2026/09/30 (三)', label: '2026/09/30 (三)' },  <== 伺服器載入
// ]
// value 對應 <option value="">，使用者選取後可透過 selectDom.value 取得，並作為實際傳給後端的值
export const dates = ref<Option[]>([{ value: '', label: '不限' }])

export const versions = ref<Option[]>([{ value: '', label: '不限' }])

export async function fetchVersionsOrDates(url: string): Promise<Option[]> {
  let res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const versions: string[] = await res.json()
  return [
    { value: '', label: '不限' },
    ...versions.map(v => ({ value: v, label: v })),
  ]
}

export async function start() {
  // 同時發出，其中一個失敗就全失敗
  const [v, d] = await Promise.all([
    fetchVersionsOrDates(API.versions),
    fetchVersionsOrDates(API.dates),
  ])
  versions.value = v
  dates.value = d
}

// endregion

export default reactive({
  theaters,
  ratings,
  dates,
  versions,
})
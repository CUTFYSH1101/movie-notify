import { type Dict } from '@/js/api/Dict.ts'
import { API } from '@shared/paths.ts'

export type CityDataKey = keyof CityData
export interface CityData {
  name: string,
  movieCount: number,
  theaterIds: string[],
  versions: string[],
}

export async function fetchCityData(cities: string[], url: string): Promise<Dict> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw: Record<string, string[]> = await res.json()
  // 用 `array.includes(elem)` 不要用 `elem in array`
  // 類字典沒有 .filter() 方法，要用 Object.entries() 轉陣列
  return Object.fromEntries(Object.entries(raw).filter(([key]) => cities.includes(key)))
}

export async function fetchCityDatas(cities: string[]) {
  const movieCountMap = await fetchCityData(cities, API.city_movie_counts)
  const theaterIdsMap = await fetchCityData(cities, API.city_theater_ids)
  const versionsMap = await fetchCityData(cities, API.city_versions)
  const cityDatas: CityData[] = []
  Object.entries(movieCountMap).forEach(([key, value]) => {
    const data: CityData = {
      name: key,
      movieCount: Number(value),
      theaterIds: theaterIdsMap[key],
      versions: versionsMap[key],
    }
    cityDatas.push(data)
  })
  return cityDatas
}
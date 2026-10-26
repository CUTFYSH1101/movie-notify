import { ref, readonly, computed, type ComputedRef } from 'vue'
import { type CityData, type CityDataKey, fetchCityDatas } from '@/js/api/cityDatas'
import taiwan from '@assets/taiwan-map.json'
import { Color, lerpColor } from '@/js/utils/colorLerp.ts'
import { isEmpty } from '@/js/utils/isEmpty.ts'
import { fetchTheaters, type Theater } from '@/js/api/theaters.ts'
import { compareTitles } from '@/js/utils/sortByTitle.ts'
import { cityRank } from '@/js/utils/sortByCity.ts'

const loading = ref<boolean>(true)
const theaters = ref<Theater[]>([])
const cities = ref<string[]>([])
const _cityDatas = ref<CityData[]>([])
const _activeCity = ref<string>('')
const orange = new Color(244, 187, 95)
const light = new Color(250, 236, 215)
export const cityDatas = readonly(_cityDatas)
export const activeCity = readonly(_activeCity)
export type Dict = Record<string, Theater[]>  // cityShortName: Theater[]
export const allTheaters: ComputedRef<Dict> = computed(() => {
  const result: Dict = {}
  theaters.value
    .sort((a, b) => compareTitles(a.name, b.name)) // 根據影城名稱排序
    .forEach(t => {
      if (!(t.city in result)) result[t.city] = []
      result[t.city].push(t)
    })
  // Object.entries(Record<key, value>) 會變成 [key, value]，所以第一個元素就是 key
  return Object.fromEntries(
    Object.entries(result)
      .sort((a, b) => cityRank(a[0]) - cityRank(b[0]))
  )
})

async function start() {
  try {
    theaters.value = await fetchTheaters()
    cities.value = taiwan.pieces.map(p => p.shortName)  // 前端決定用 shortName 而不是 city
    cities.value = cities.value.sort((a, b) => cityRank(a) - cityRank(b))
    _cityDatas.value = await fetchCityDatas(cities.value)
    _cityDatas.value = _cityDatas.value.sort((a, b) => cityRank(a.name) - cityRank(b.name))
  } finally {
    loading.value = false
  }
}

// toggle class
function onClickCity(city: string) {
  if (_activeCity.value == city) _activeCity.value = ''
  else _activeCity.value = city
}

function getCityData(city: string): CityData | undefined {
  return _cityDatas.value.find(d => d.name == city)
}

function getCityMovieCount(city: string): number {
  return getCityData(city)?.movieCount ?? 0
}

function getCityTheatersCount(city: string): number {
  return getCityData(city)?.theaterIds?.length ?? 0
}

function getCityTheaters(city: string): Theater[] | undefined {
  const ids = getCityData(city)?.theaterIds
  return ids?.map(id => theaters.value?.find(d => d.id == id))
    ?.filter((d): d is Theater => d !== undefined)  // .filter(d => d)
}

function getCityVersions(city: string): string[] {
  const versions = getCityData(city)?.versions
  return versions ? versions : []
}

function minMax(key: CityDataKey): [number, number] {
  switch (key) {
    case 'movieCount': {
      let data = _cityDatas.value.map(d => d.movieCount)
      let min = Math.min(...data)
      let max = Math.max(...data)
      return [min, max]
    }
    case 'theaterIds' : {
      let data = _cityDatas.value.map(d => d.theaterIds.length)
      let min = Math.min(...data)
      let max = Math.max(...data)
      return [min, max]
    }
    case 'versions': {
      let data = _cityDatas.value.map(d => d.versions.length)
      let min = Math.min(...data)
      let max = Math.max(...data)
      return [min, max]
    }
    default:
      throw new Error(`key:${key} 超出範圍`)
  }
}

function current(key: CityDataKey, city: string): number {
  if (!isEmpty(cities.value) && !cities.value.includes(city))
    throw new Error(`city:${city} 超出範圍 ${cities.value}`)
  switch (key) {
    case 'movieCount':
      return getCityMovieCount(city)
    case 'theaterIds' :
      return getCityTheatersCount(city)
    case 'versions':
      return getCityVersions(city).length
    default:
      throw new Error(`key:${key} 超出範圍`)
  }
}

function colorLerp(key: CityDataKey, city: string): Color {
  const [min, max] = minMax(key)
  const current_ = current(key, city)
  return lerpColor([min, max], [light, orange], current_)
}

export default {
  loading,
  cities,
  cityDatas,
  activeCity,
  start,
  onClickCity,
  getCityData,
  getCityMovieCount,
  getCityTheatersCount,
  getCityTheaters,
  getCityVersions,
  colorLerp,
}
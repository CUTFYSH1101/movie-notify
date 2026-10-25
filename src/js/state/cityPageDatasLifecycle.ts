import { ref } from 'vue'
import { type CityData, type CityDataKey, fetchCityDatas } from '@/js/api/cityDatas'
import taiwan from '@assets/taiwan-map.json'
import { Color, lerpColor } from '@/js/utils/colorLerp.ts'
import { isEmpty } from '@/js/utils/isEmpty.ts';

const loading = ref<boolean>(true)
const cities = ref<string[]>([])
const cityDatas = ref<CityData[]>([])
const activeCity = ref<string>('')
const orange = new Color(244, 187, 95)
const light = new Color(250, 236, 215)

async function start() {
  try {
    cities.value = taiwan.pieces.map(p => p.shortName)  // 前端決定用 shortName 而不是 city
    cityDatas.value = await fetchCityDatas(cities.value)
  } finally {
    loading.value = false
  }
}

// toggle class
function onClickCity(city: string) {
  if (activeCity.value == city) activeCity.value = ''
  else activeCity.value = city
}

function getCityData(city: string) {
  return cityDatas.value.find(d => d.name == city)
}

function minMax(key: CityDataKey): [number, number] {
  switch (key) {
    case 'movieCount': {
      let data = cityDatas.value.map(d => d.movieCount)
      let min = Math.min(...data)
      let max = Math.max(...data)
      return [min, max]
    }
    case 'theaterIds' : {
      let data = cityDatas.value.map(d => d.theaterIds.length)
      let min = Math.min(...data)
      let max = Math.max(...data)
      return [min, max]
    }
    case 'versions': {
      let data = cityDatas.value.map(d => d.versions.length)
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
      return getCityData(city)?.movieCount ?? 0
    case 'theaterIds' :
      return getCityData(city)?.theaterIds?.length ?? 0
    case 'versions':
      return getCityData(city)?.versions?.length ?? 0
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
  colorLerp,
}
import { reactive, ref } from 'vue'
import { fetchTheater, type Theater } from '@/js/api/theaters.ts'
import {
  type MovieShowtimes,
  type Showtimes,
  filterShowtimes,
  groupByMovie,
  fetchTheaterShowtimes,
  GENERAL
} from '@/js/api/showtimesForTheater.ts'
import { Filters } from '@/js/filters/filters.ts'

import type { Option } from '@/js/filters/Option.ts'

export const dateOptions = ref<Option[]>()
export const movieOptions = ref<Option[]>()
export const versionOptions = ref<Option[]>()
export { ratings as ratingOptions } from '@/js/filters/filtersOptions.ts'
export { r2src } from '@/js/utils/rating.ts'
import { dateLabel } from '@/js/utils/dates.ts'
import { compareTitles } from '@/js/utils/sortByTitle.ts'

export const loading = ref<boolean>(true)
export const theaterId = ref<string>('')
export const theater = ref<Theater>()
export const allTheaterShowtimes = ref<Showtimes[]>([])
export const currentShowtimes = ref<Showtimes[]>([])
export const showtimesUI = ref<MovieShowtimes[]>([])
export const filtersForTheaterPage = reactive<Filters>(new Filters())
export const facetForTheaterPage = ref<Facets>()

const ts2DateOption = (ts: Showtimes) => ({ value: ts.date, label: dateLabel(ts.date) })
const ts2MovieOption = (ts: Showtimes) => ({ value: ts.movieId, label: ts.movieName })
// 空版本（一般場）用 GENERAL 當選單值，顯示為「一般場」
const ts2VersionOption = (ts: Showtimes) => ({
  value: ts.version || GENERAL,
  label: ts.version || '一般場',
})
export type Facets = Record<string, (string | null)[]>

function drop_duplicates<K extends Option>(array: Array<K>): Array<K> {
  // [...new Set(array)] 沒用 因為 元素是物件
  const seen = new Set<string>()
  return array.filter(el => {
    if (seen.has(el.value)) return false
    else {
      seen.add(el.value)
      return true
    }
  })
}

export async function start() {
  try {
    // Vue: Argument of type Ref<string, string> is not assignable to parameter of type string
    // 型別為 Ref<string, string> 的引數，無法指定給型別為 string 的參數
    // 記得加上 .value
    theater.value = await fetchTheater(theaterId.value)
    allTheaterShowtimes.value = await fetchTheaterShowtimes(theaterId.value)
    dateOptions.value = drop_duplicates(allTheaterShowtimes.value
      .map(ts2DateOption))
    movieOptions.value = drop_duplicates(allTheaterShowtimes.value
      ?.map(ts2MovieOption))
      ?.sort((a, b) => compareTitles(a.label, b.label))
    versionOptions.value = drop_duplicates(allTheaterShowtimes.value
      ?.map(ts2VersionOption))
      ?.sort((a, b) => compareTitles(a.label, b.label))

    // 預設載入第一筆
    filtersForTheaterPage.date = dateOptions.value[0].value
    currentShowtimes.value = filterShowtimes(allTheaterShowtimes.value, filtersForTheaterPage)
    showtimesUI.value = groupByMovie(currentShowtimes.value) ?? []
    facetForTheaterPage.value = computeFacets(filtersForTheaterPage)
  } finally {
    loading.value = false
  }
}

export async function update() {
  currentShowtimes.value = filterShowtimes(allTheaterShowtimes.value, filtersForTheaterPage)
  showtimesUI.value = groupByMovie(currentShowtimes.value) ?? []
  facetForTheaterPage.value = computeFacets(filtersForTheaterPage)
}

function computeFacets(f: Filters): Facets {
  // date 與 filterShowtimes 一致視為必填（不加 !f.date 豁免），
  // 否則 date 為空時 facet 會把所有廳型/分級算成可選，但實際過濾因 date=='' 全部落空
  const matchDates = (s: Showtimes) => f.date == s.date
  const matchMovies = (s: Showtimes) => !f.movie || s.movieName.includes(f.movie)
  const matchVersions = (s: Showtimes) => !f.version || (f.version === GENERAL ? !s.version : f.version == s.version)
  const matchRatings = (s: Showtimes) => !f.rating || f.rating == s.rating
  const availableDates = allTheaterShowtimes.value
    .filter(ts => matchMovies(ts) && matchVersions(ts) && matchRatings(ts))
    .map(ts => ts.date)
  const availableMovies = allTheaterShowtimes.value
    .filter(ts => matchDates(ts) && matchVersions(ts) && matchRatings(ts))
    .map(ts => ts.movieId)
  const availableVersions = allTheaterShowtimes.value
    .filter(ts => matchMovies(ts) && matchDates(ts) && matchRatings(ts))
    .map(ts => ts.version || GENERAL)
  const availableRatings = allTheaterShowtimes.value
    .filter(ts => matchMovies(ts) && matchVersions(ts) && matchDates(ts))
    .map(ts => ts.rating)
  return {
    'date': availableDates ?? [],
    'movie': availableMovies ?? [],
    'version': availableVersions ?? [],
    'rating': availableRatings ?? [],
  }
}

export default {
  dateOptions,
  movieOptions,
  versionOptions,
  dateLabel,
}
import type { Filters } from '@/js/filters.ts'
import { API } from '@shared/paths.ts'

/*{
  "theaterId": "t0401",
  "theaterName": "台中大遠百威秀影城",
  "city": "台中市",
  "date": "2026-10-21",
  "time": "10:30",
  "version": "IMAX"
}*/
export interface ShowTimesRaw {
  theaterId: string
  theaterName: string
  city: string
  date: string
  time: string
  version: string
}

export interface VersionShowtimes {
  version: string
  times: string[]
}

export interface TheaterShowtimes {
  theaterId: string
  theaterName: string
  city: string
  rows: VersionShowtimes[]
}

export interface DateShowtimes {
  date: string
  theaters: TheaterShowtimes[]
}

export async function fetchMovieShowtimes(movie_id: string, f?: Filters) {
  const params = new URLSearchParams()
  if (f) {
    if (f.notDefault('theater')) params.append('theater_name', f.theater)
    if (f.notDefault('date')) params.append('date', f.date)
    if (f.notDefault('city')) params.append('city', f.city)
  }
  const res = await fetch(`${API.move_showtimes(movie_id)}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function groupByTheater(list: ShowTimesRaw[]): DateShowtimes[] {
  function setOrCreate<K, V>(map: Map<K, V[]>, key: K, newValue: V) {
    let oldValues = map.get(key)
    if (oldValues) map.set(key, [...new Set([...oldValues, newValue])])
    else map.set(key, [newValue])
  }

  const result: DateShowtimes[] = []
  const dateMap = new Map<string, string[]>()     // date: [`${date}-${theater}`,...]
  const dTheaterMap = new Map<string, string[]>()  // `${date}-${theater}`: [`${date}-${theater}-${version}`,...]
  const tVersionMap = new Map<string, string[]>() // `${date}-${theater}-${version}`: ['10:10','10:20']
  list.forEach(raw => {
    const newValueD_KeyT = `${raw.date}-${raw.theaterId}`
    const keyD = raw.date
    setOrCreate(dateMap, keyD, newValueD_KeyT)

    const newValueT_keyV = `${raw.date}-${raw.theaterId}-${raw.version}`
    setOrCreate(dTheaterMap, newValueD_KeyT, newValueT_keyV)

    const newValueV = raw.time
    setOrCreate(tVersionMap, newValueT_keyV, newValueV)
  })
  // console.log(dateMap)
  // console.log(dTheaterMap)
  // console.log(tVersionMap)
  // value: ['5/2-aaa', '5/2-bbb']
  // key: '5/2'
  dateMap.forEach((value, key) => {
    const date = key
    const theaters: TheaterShowtimes[] = []
    value.forEach(dt => {  // dt => date-theater
      const theaterId = dt.split('-')[1]
      const s = list.find(el => el.theaterId == theaterId)
      const dtvs = dTheaterMap.get(dt)  // dtvs => date-theater-version's
      const versions: VersionShowtimes[] = []
      dtvs!!.forEach(dtv => {  // 不可能為空所以加上!!
        const times = tVersionMap.get(dtv)
        const version = dtv.split('-')[2]
        // console.log(dtv.split('-'), 'hi', version, times)
        versions.push({ version: version, times: times || [] })
      })
      theaters.push({
        theaterId: theaterId,
        theaterName: s!!.theaterName,
        city: s!!.city,
        rows: versions || []
      })
    })
    result.push({ date: date, theaters: theaters })
  })
  // console.log(result)
  return result
}

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
  raw: VersionShowtimes[]
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
  /*  let result = new Map<string, string[]>()
  list.forEach((raw: ShowTimesRaw) => {
    let group = result.get(raw.date)
    if (!group) result.set(raw.date, [raw.theaterName])
    else result.set(raw.date, [...group, raw.theaterName])
  })*/
  /*  let result = new Map<string, TheaterShowtimes[]>()
    let theaters = new Map<string, string>()
    list.forEach((raw: ShowTimesRaw) => {
      let group = result.get(raw.date)
      let theater = theaters.get(raw.theaterId)
      let obj: TheaterShowtimes = {
        theaterId: raw.theaterId,
        theaterName: raw.theaterName,
        city: raw.city,
        raw: []
      }
      if (!group) result.set(raw.date, [obj])
      if (!theater) theaters.set(raw.theaterId, raw.theaterName)
      if (group && !theater)result.set(raw.date, [...group, obj])
    })*/
  // key: 日期，value: 那一天的影城們
  let result = new Map<string, TheaterShowtimes[]>()

  list.forEach((raw: ShowTimesRaw) => {
    // 1. 找這一天的影城陣列，沒有就建立一個空陣列
    let group = result.get(raw.date)
    if (!group) {
      group = []
      result.set(raw.date, group)
    }

    // 2. 在「這一天」裡找這間影城，沒有就建立
    let theater = group.find(t => t.theaterId === raw.theaterId)
    if (!theater) {
      theater = {
        theaterId: raw.theaterId,
        theaterName: raw.theaterName,
        city: raw.city,
        raw: []
      }
      group.push(theater)
    }

    // 3. 在這間影城裡找廳型，沒有就建立
    let version = theater.raw.find(v => v.version === raw.version)
    if (!version) {
      version = { version: raw.version, times: [] }
      theater.raw.push(version)
    }

    // 4. 把時間放進這個廳型
    version.times.push(raw.time)
  })

  // 5. Map 轉成 DateShowtimes[]
  let dateShowtimes: DateShowtimes[] = []
  result.forEach((theaters, date) => {
    dateShowtimes.push({ date: date, theaters: theaters })
  })
  return dateShowtimes
}

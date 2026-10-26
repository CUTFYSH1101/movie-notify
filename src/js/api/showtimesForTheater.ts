import { API } from '@shared/paths.ts'
import type { Filters } from '@/js/filters/filters.ts'

export interface Showtimes {
  movieId: string,
  movieName: string,
  poster: string,
  runtime: string,
  rating: string,
  date: string,
  time: string,
  version: string,
}

export interface VersionShowtimes {
  version: string,
  times: string[]
}

export interface MovieShowtimes {
  movieId: string,
  movieName: string,
  poster: string,
  runtime: string,
  rating: string,
  versions: VersionShowtimes[]
}

export async function fetchTheaterShowtimes(theater_id: string): Promise<Showtimes[]> {
  const res = await fetch(API.theater_showtimes(theater_id))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// 注意 f 和 date 不能是空值，不然 groupByMovie 並未按照 date 分組 會把 不同天的 當作 同一天
export function filterShowtimes(source: Showtimes[], f?: Filters): Showtimes[] {
  if (!f) return source
  return source.filter(s =>
    (!f.movie || s.movieName.includes(f.movie)) &&
    (!f.rating || f.rating == s.rating) &&
    f.date == s.date &&
    (!f.version || f.version == s.version)
  )
}

export function groupByMovie(source: Showtimes[]): MovieShowtimes[] | undefined {
  function setOrCreate<K, V>(map: Map<K, V[]>, key: K, newValue: V) {
    let oldValues = map.get(key)
    if (oldValues) map.set(key, [...new Set([...oldValues, newValue])])
    else map.set(key, [newValue])
  }

  const result: MovieShowtimes[] = []
  const movieMap = new Map<string, string[]>()  // movieId: [`${movie}${version}`,...]
  const mVersionMap = new Map<string, string[]>() // `${movie}${version}`: ['10:10','10:20']
  source.forEach(raw => {
    const newValueM_keyV = `${raw.movieId}${raw.version}`
    const keyM = raw.movieId
    setOrCreate(movieMap, keyM, newValueM_keyV)

    const newValueV = raw.time
    setOrCreate(mVersionMap, newValueM_keyV, newValueV)
  })
  movieMap.forEach((value, key) => {
    const rows: VersionShowtimes[] = []
    value.forEach(mv => {
      const version = mv.split(key)[1]
      const times = mVersionMap.get(mv)  // times
      rows.push({ 'version': version, 'times': times ?? [] })
    })
    const s: Showtimes | undefined = source.find(s => s.movieId === key)
    result.push({
      'movieId': key,
      'movieName': s?.movieName ?? '',
      'poster': s?.poster ?? '',
      'runtime': s?.runtime ?? '',
      'rating': s?.rating ?? '',
      'versions': rows
    })
  })
  return result
}
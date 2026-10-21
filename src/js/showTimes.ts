import type { Filters } from '@/js/filters.ts'
import { API } from '@shared/paths.ts';

/*{
  "theaterId": "t0401",
  "theaterName": "台中大遠百威秀影城",
  "city": "台中市",
  "date": "2026-10-21",
  "time": "10:30",
  "version": "IMAX"
}*/
export interface ShowTimes {
  theaterId: string
  theaterName: string
  city: string
  date: string
  time: string
  version: string
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
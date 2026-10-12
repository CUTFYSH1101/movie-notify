import { API } from '@shared/paths.ts'
import { allJoinShowings } from '@/js/datasLifecycle.ts'

export interface JoinShowing {
  movie_id: string
  movie_title: string
  movie_poster: string
  movie_href: string
  movie_runtime: string | null
  movie_rating_system: string | null
  movie_release_date: string | null
  theater_id: string
  theater_name: string
  theater_city: string
  theater_href: string
  date: string
  time: string
  version: string | null
}

export async function fetchJoinShowings(): Promise<JoinShowing[]> {
  const res = await fetch(API.join_showings)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getVersions(movie_id: string, theater_id?: string): Promise<(string | null)[]> {
  const versions = allJoinShowings.value
    .filter(s => s.movie_id === movie_id && (!theater_id?.trim() || theater_id?.trim() === s.theater_id))
    .map(s => s.version)
    .filter(v => v?.trim())  // 把''的當作沒有
    .sort((a, b) => a!.localeCompare(b!)) || []  // // Vue: a is possibly null
  console.log([...new Set(versions)])
  return [...new Set(versions)]
}
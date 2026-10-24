import { API } from '@shared/paths.ts'

export type MovieVersions = Record<string, string[]>

// 某部電影有哪些廳型，由後端 /api/movie_versions 查
// theater_name 是影城名稱關鍵字，後端模糊比對，沒給就是全部影城
export async function fetchMoviesVersions(movie_ids: string[], theater_name?: string): Promise<MovieVersions> {
  const params = new URLSearchParams()
  movie_ids.forEach(id => params.append('movie_id', id))
  if (theater_name?.trim())
    params.append('theater', theater_name.trim())
  const res =
    await fetch(`${API.movie_versions}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

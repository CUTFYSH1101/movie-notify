import { API } from '@shared/paths.ts'
import { type Filters } from '@/js/filters.ts'

export interface Movie {
  id: string
  title: string
  poster: string
  href: string
  runtime: string | null
  movie_rating_system: string | null
  release_date: string | null
}

export async function fetchMovies(f?: Filters): Promise<Movie[]> {
  // await fetch('/api/movies')
  // await fetch('http://127.0.0.1:5000/api/movies?')
  // await fetch(`http://127.0.0.1:5000/api/movies?theater=${f.theater}&date=${f.date}&version=${f.version}`)
  const params = new URLSearchParams()
  if (f) {
    if (f.notDefault('theater')) params.append('theater', f.theater)
    if (f.notDefault('date')) params.append('date', f.date)
    if (f.notDefault('version')) params.append('version', f.version)
  }
  console.log(`${API.movies}?${params}`)
  const res = await fetch(`${API.movies}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
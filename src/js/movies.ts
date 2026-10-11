import { API } from '@shared/paths.ts'
import type { Filters } from '@/js/filters.ts';

export interface Movie {
  id: string
  title: string
  poster: string
  href: string
  runtime: string | null
  movie_rating_system: string | null
  release_date: string | null
}

export async function fetchMovies0(): Promise<Movie[]> {
  const res = await fetch(API.movies)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchMovies1(f: Filters): Promise<Movie[]> {
  // await fetch(`${API.movies_params}?theater=${f.theater}&date=${f.date}&version=${f.version}`)
  // await fetch(`${API.movies_params}?`)
  const params = new URLSearchParams()
  if (f.theater) {
    params.append("theater", f.theater)
  }
  if (f.date) {
    params.append("date", f.date)
  }
  if (f.version) {
    params.append("version", f.version)
  }
  const res = await fetch(`${API.movies_params}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchMovies(filters?: Filters): Promise<Movie[]> {
  return filters === undefined ? fetchMovies0() : fetchMovies1(filters)
}
export interface Movie {
  id: string
  title: string
  poster: string
  href: string
  runtime: string | null
  movie_rating_system: string | null
  release_date: string | null
}

export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch('/api/movies')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

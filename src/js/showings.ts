import { API } from '@shared/paths.ts';

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
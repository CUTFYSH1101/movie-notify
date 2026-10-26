import { API } from '@shared/paths.ts'
import { type Filters } from '@/js/filters/filters.ts'

export interface Theater {
  id: string
  name: string
  city: string
  href: string | null
}

export async function fetchTheaters(f?: Filters): Promise<Theater[]> {
  const params = new URLSearchParams()
  if (f && f.notDefault('city')) params.append('city', f.city)
  const res = await fetch(`${API.theaters}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchTheater(theater_id: string): Promise<Theater> {
  const res = await fetch(API.theater(theater_id))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
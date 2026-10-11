import { API } from '@shared/paths.ts'
import { type Filters } from '@/js/filters.ts'

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
import { API } from '@shared/paths.ts'
import { getSubscriberId } from '@/js/state/subscriber.ts'

// 查目前這個訂閱者追蹤了哪些 movie_id
export async function fetchTrackedMovieIds(): Promise<string[]> {
  const params = new URLSearchParams({ subscriber_id: getSubscriberId() })
  const res = await fetch(`${API.tracks}?${params}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// 追蹤一部電影（同時帶上 email；後端會 upsert 訂閱者）
export async function addTrack(email: string, movieId: string): Promise<void> {
  const res = await fetch(API.track, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriber_id: getSubscriberId(), email, movie_id: movieId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

// 取消追蹤
export async function removeTrack(movieId: string): Promise<void> {
  const res = await fetch(API.track, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriber_id: getSubscriberId(), movie_id: movieId }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

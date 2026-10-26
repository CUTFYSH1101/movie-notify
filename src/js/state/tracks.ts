import { ref } from 'vue'
import { addTrack, fetchTrackedMovieIds, removeTrack } from '@/js/api/track.ts'
import { setEmail } from '@/js/state/subscriber.ts'

// 目前追蹤中的 movie_id 集合，給各元件共用（Header 徽章數字、電影卡/彈窗的「已追蹤」狀態）
export const trackedIds = ref<Set<string>>(new Set())
export const trackLoaded = ref(false)

// App 啟動時呼叫一次，把後端的追蹤清單載進來
export async function loadTracks(): Promise<void> {
  try {
    trackedIds.value = new Set(await fetchTrackedMovieIds())
  } catch (e) {
    console.warn('載入追蹤清單失敗', e)
  } finally {
    trackLoaded.value = true
  }
}

export function isTracked(movieId: string): boolean {
  return trackedIds.value.has(movieId)
}

// 追蹤：成功後記住 email 並更新本地集合（重建 Set 以觸發畫面更新）
export async function track(movieId: string, email: string): Promise<void> {
  await addTrack(email, movieId)
  setEmail(email)
  const next = new Set(trackedIds.value)
  next.add(movieId)
  trackedIds.value = next
}

export async function untrack(movieId: string): Promise<void> {
  await removeTrack(movieId)
  const next = new Set(trackedIds.value)
  next.delete(movieId)
  trackedIds.value = next
}

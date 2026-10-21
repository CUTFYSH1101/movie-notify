// runtime 有可能''或undefined，判空條件設 movie.runtime || ''(v-if)
export function formatRuntime(runtime?: string | null): string {
  if (!runtime || !runtime.trim()) return ''
  return runtime.replace(/^\D*(\d+)\D*$/, '$1 分鐘') || ''
}
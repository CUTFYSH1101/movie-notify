const rating2srcMap: Record<string, string> = {
  '普遍級': 'GSRR_G_logo.svg',
  '保護級': 'GSRR_P_logo.svg',
  '輔12級': 'GSRR_PG_12_logo.svg',
  '輔15級': 'GSRR_PG_15_logo.svg',
  '限制級': 'GSRR_R_logo.svg',
}

export function r2src(rating: string | null): string | undefined {
  const keys = Object.keys(rating2srcMap)

  // 用 const，ts 會記得 includes 為 true 就代表 rating 不是 null
  const includes = rating && keys.includes(rating)

  if (!includes) return undefined
  return new URL(`../assets/${rating2srcMap[rating]}`, import.meta.url).href
}
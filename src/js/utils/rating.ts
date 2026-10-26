import G from '@assets/GSRR_G_logo.svg'
import P from '@assets/GSRR_P_logo.svg'
import PG12 from '@assets/GSRR_PG_12_logo.svg'
import PG15 from '@assets/GSRR_PG_15_logo.svg'
import R from '@assets/GSRR_R_logo.svg'

const rating2srcMap: Record<string, string> = {
  '普遍級': G,
  '保護級': P,
  '輔12級': PG12,
  '輔15級': PG15,
  '限制級': R,
}

export function r2src(rating: string | null): string | undefined {
  const keys = Object.keys(rating2srcMap)

  // 用 const，ts 會記得 includes 為 true 就代表 rating 不是 null
  const includes = rating && keys.includes(rating)

  if (!includes) return undefined
  return rating2srcMap[rating]
}
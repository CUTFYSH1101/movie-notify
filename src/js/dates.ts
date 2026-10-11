// :02d
const pad = (n: number) => String(n).padStart(2, '0')

function to_mm_dd(yyyy_mm_dd_week: string): string {
  const date = toDate(yyyy_mm_dd_week)
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`
}

function toDate(yyyy_mm_dd_week: string): Date {
  const [y, m, d] = yyyy_mm_dd_week.split(' ')[0].split(/[-/]/).map(Number)
  return new Date(y, m - 1, d)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()
}

export function dateLabel(yyyy_mm_dd_week: string): string {
  if (yyyy_mm_dd_week == '不限') return '不限'

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const date = toDate(yyyy_mm_dd_week)
  if (isSameDay(date, today)) return '今天'
  else if (isSameDay(date, tomorrow)) return '明天'
  else return to_mm_dd(yyyy_mm_dd_week)
}

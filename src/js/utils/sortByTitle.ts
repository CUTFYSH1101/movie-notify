// 英文（含數字開頭）片名排前面 A-Z，中文片名接在後面依注音排
const latin = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
const zhuyin = new Intl.Collator('zh-Hant-TW-u-co-zhuyin')

const isLatin = (title: string) => /^[\x21-\x7e]/.test(title.trimStart())

export function compareTitles(a: string, b: string): number {
    const aLatin = isLatin(a)
    const bLatin = isLatin(b)
    if (aLatin !== bLatin) return aLatin ? -1 : 1
    return aLatin ? latin.compare(a, b) : zhuyin.compare(a, b)
}

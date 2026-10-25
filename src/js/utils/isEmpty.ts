export function isEmpty(value: unknown): boolean {
  if (value == null) return true                                        // null、undefined
  if (typeof value === 'string') return value.trim() === ''             // '' ' '
  if (Array.isArray(value)) return value.length === 0                   // []
  if (value instanceof Map || value instanceof Set) return value.size === 0
  if (typeof value === 'object') return Object.keys(value).length === 0 // {}
  return false                                                          // 數字、布林等不算空
}
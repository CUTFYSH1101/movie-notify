// 無密碼、無會員的「訂閱者身分」：
// 第一次用時產生一組隨機 id 存進 localStorage，之後都用同一組。
// email 也一併記在 localStorage，使用者只要填一次。
// 注意：localStorage 會被使用者清除、換瀏覽器/裝置也不共用，這是純前端能做到的最durable方案。

const SUB_ID_KEY = 'movie-notify:subscriber-id'
const EMAIL_KEY = 'movie-notify:email'

function safeGet(key: string): string | null {
  // 無痕視窗、停用儲存等情況讀取可能丟例外，包起來避免整頁壞掉
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 寫不進去就算了（例如無痕模式），功能仍可運作只是這次不會被記住
  }
}

export function getSubscriberId(): string {
  let id = safeGet(SUB_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    safeSet(SUB_ID_KEY, id)
  }
  return id
}

export function getEmail(): string {
  return safeGet(EMAIL_KEY) ?? ''
}

export function setEmail(email: string): void {
  safeSet(EMAIL_KEY, email.trim())
}

import { ref } from 'vue'

// HTMLDialogElement 是瀏覽器內建的 DOM 介面（型別），代表一個 <dialog> 元素
export const dialogRef = ref<HTMLDialogElement>()
export const currentMovieId = ref<string>()
// 瀏覽器會將它放到 top layer（最上層），通常顯示在畫面中央，並提供背景遮罩與焦點管理
// 類似於加上 z-index:999、autofocus、給背景一個遮罩顏色、點擊背景關閉...等功能
// 這是 HTML 給 <dialog> 自帶的功能，需要呼叫 .showModal 才會執行上面一系列功能
export const open = (movie_id: string) => {
  currentMovieId.value = movie_id
  dialogRef.value?.showModal()
}
// 點到 ::backdrop 時隱藏
// 點到 .content 時沒反應
export const closeOnBackdrop = (e: MouseEvent) => {
  if (e.target === dialogRef.value) dialogRef.value?.close()
}

export default {
  dialogRef,
  currentMovieId,
  open,
  closeOnBackdrop,
}
import { ref } from 'vue'

export const activeMovie = ref<string>('')
export const switchMovie = (movieId: string) => {
  if (activeMovie.value == movieId) activeMovie.value = ''
  else activeMovie.value = movieId
}
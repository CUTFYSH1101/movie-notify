import { ref } from 'vue'
import { fetchMovies, type Movie } from '@/js/movies.ts'
import { fetchTheaters, type Theater } from '@/js/theaters.ts'
import { fetchJoinShowings, type JoinShowing } from '@/js/showings.ts'
import { Filters } from '@/js/filters.ts'
import { compareTitles } from '@/js/sortByTitle.ts'

export const movies = ref<Movie[]>()
export const moviesOptions = ref<Movie[]>()
export const allMovies = ref<Movie[]>([])
export const allJoinShowings = ref<JoinShowing[]>([])
export const theaters = ref<Theater[]>()
export const loading = ref<boolean>(true)

export async function start() {
  try {
    loading.value = true
    movies.value = await fetchMovies()
    movies.value = movies.value.sort((a, b) => compareTitles(a.title, b.title))
    moviesOptions.value = [...movies.value]
    allMovies.value = await fetchMovies()
    allJoinShowings.value = await fetchJoinShowings()
    theaters.value = await fetchTheaters()
  } finally {
    loading.value = false
  }
}

export async function update(filters: Filters) {
  try {
    loading.value = true
    movies.value = await fetchMovies(filters)
    movies.value = movies.value.sort((a, b) => compareTitles(a.title, b.title))
    if (filters.rating)
      movies.value = movies.value.filter(m => m.movie_rating_system === filters.rating)
    moviesOptions.value = [...movies.value]  // 每次 update 重新載入所有電影，並在篩選電影名稱前先複製電影選項
    if (filters.movie)
      movies.value = moviesOptions?.value?.filter(m => m.title.includes(filters.movie))
    theaters.value = await fetchTheaters(filters)
  } finally {
    loading.value = false
  }
}

export default {
  start,
  update,
  movies,
  theaters,
  loading,
}
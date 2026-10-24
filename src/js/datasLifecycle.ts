import { ref } from 'vue'
import { fetchMovies, type Movie } from '@/js/movies.ts'
import { fetchTheaters, type Theater } from '@/js/theaters.ts'
import { Filters } from '@/js/filters.ts'
import { compareTitles } from '@/js/sortByTitle.ts'
import { fetchFacets, type Facets } from '@/js/filtersFacetDisabled.ts'
import { fetchMoviesVersions, type MovieVersions } from '@/js/moviesVersions.ts'

export const movies = ref<Movie[]>()
export const moviesOptions = ref<Movie[]>()
export const theaters = ref<Theater[]>()
export const facets = ref<Facets>()  // 篩選選項哪些還可以選，給 withDisabled
export const loading = ref<boolean>(true)
export const moviesVersions = ref<MovieVersions>({})

export async function start() {
  try {
    loading.value = true
    movies.value = await fetchMovies()
    movies.value = movies.value.sort((a, b) => compareTitles(a.title, b.title))
    moviesVersions.value = await fetchMoviesVersions(movies.value.map(m => m.id))
    moviesOptions.value = [...movies.value]
    theaters.value = await fetchTheaters()
    facets.value = await fetchFacets()
  } finally {
    loading.value = false
  }
}

export async function update(filters: Filters) {
  try {
    loading.value = true
    movies.value = await fetchMovies(filters)
    movies.value = movies.value.sort((a, b) => compareTitles(a.title, b.title))
    moviesVersions.value = await fetchMoviesVersions(movies.value.map(m => m.id), filters.theater)
    if (filters.rating)
      movies.value = movies.value.filter(m => m.movie_rating_system === filters.rating)
    moviesOptions.value = [...movies.value]  // 每次 update 重新載入所有電影，並在篩選電影名稱前先複製電影選項
    if (filters.movie)
      movies.value = moviesOptions?.value?.filter(m => m.title.includes(filters.movie))
    theaters.value = await fetchTheaters(filters)
    facets.value = await fetchFacets(filters)
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
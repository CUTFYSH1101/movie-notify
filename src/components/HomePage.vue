<script setup lang="ts">
import Header_ from '@/components/Header_.vue'
import MovieCard from '@/components/MovieCard.vue'
import { fetchMovies, type Movie } from '@/js/movies.ts'
import { type Filters, filters } from '@/js/filters.ts'
import { onMounted, ref, watch } from 'vue'
import DockOpen from '@/components/DockOpen.vue';

const movies = ref<Movie[]>()
const loading = ref<boolean>(true)

onMounted(async () => {
  try {
    movies.value = await fetchMovies()
  } finally {
    loading.value = false
  }
})

watch(filters, async (val: Filters) => {
  try {
    movies.value = await fetchMovies(val)
    if (filters.rating)
      movies.value = movies.value.filter(m => m.movie_rating_system === filters.rating)
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <Header_/>
  <main>
    <h1>上映中電影</h1>
    <p v-if="loading">載入中...</p>
    <ul v-else class="movies-grid">
      <MovieCard v-for="movie in movies" :movie="movie"/>
    </ul>
  </main>
  <DockOpen/>
</template>

<style scoped lang="scss">
@use '@/style' as *;

main {
  margin: 0 auto; /* auto: 水平置中 */
}

ul.movies-grid {
  gap: var(--gap-xl) var(--gap-lg);
  display: grid;

  * {
    margin: 0; /* 底下的元素由gap決定間距 */
  }
}

main {
  width: min(1320px, calc(100% - 100px));

  @media (max-width: 1000px) {
    width: min(1320px, calc(100% - 48px));
  }
}

ul.movies-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  @media (max-width: 1000px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 470px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
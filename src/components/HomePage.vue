<script setup lang="ts">
import Header_ from '@/components/Header_.vue'
import MovieCard from '@/components/MovieCard.vue'
import { type Filters, filters } from '@/js/filters.ts'
import { onMounted, watch } from 'vue'
import DockOpen from '@/components/DockOpen.vue';
// import datas from '@/js/datasLifecycle.ts'
// 避免BUG: Vue: Type true | Movie[] | undefined is not assignable to type Movie
// Type undefined is not assignable to type Movie
// datas 是普通物件，必須直接取得 movies 才會解釋成 ref
import { start, update, movies, loading } from '@/js/datasLifecycle.ts'

onMounted(start)

watch(filters, async (newVal: Filters) => update(newVal))

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
  gap: var(--gap-xxl) var(--gap-llg);
  display: grid;

  * {
    margin: 0; /* 底下的元素由gap決定間距 */
  }
}

main {
  width: min(1320px, calc(100% - 200px));

  @media (max-width: 1000px) {
    width: min(900px, calc(100% - 96px));
  }

  @media (max-width: 470px) {
    width: calc(100% - 170px);
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
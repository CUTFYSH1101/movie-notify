<script setup lang="ts">
import { fetchMovies, type Movie } from '@/js/movies.ts'
import { r2src } from '@/js/movieRatingSystem'
import { onMounted, ref } from 'vue'

const movies = ref<Movie[]>()
const loading = ref<boolean>(true)

onMounted(async () => {
  try {
    movies.value = await fetchMovies()
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <section>
    <h2>上映中電影</h2>
    <p v-if="loading">載入中...</p>
    <ul v-else class="movies-grid">
      <li v-for="movie in movies" class="movie-cell">
        <div class="poster"><img :src="movie.poster" :alt="movie.title"></div>
        <div class="info-cell">
          <h4 class="movie-title">{{ movie.title }}</h4>
          <img class="rating" :src="r2src(movie.movie_rating_system)" :alt="movie.movie_rating_system??''">
        </div>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
@use '@/style' as *;

ul.movies-grid {
  gap: var(--gap-xl) var(--gap-lg);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  * {
    margin: 0; /* 底下的元素由gap決定間距 */
  }
}

// 電影每格
.movie-cell {
  gap: 12px;
}

// 海報
// 或使用span的display:block,width:auto讓grid將子元素寬度撐滿
div.poster {
  aspect-ratio: 2 / 3; /* 寬度由 grid 算出來，高度 = 寬度 * 1.5 */

  img {
    @include size(100%);
    object-fit: cover; /* 裡面的圖片放大裁切 */
    vertical-align: bottom; /* 去掉inline底下的空隙 */
  }
}

// 電影片名+分級格
.info-cell {
  gap: 6px;
  display: flex; /* 必須是flex或grid才能搭配gap */
  flex-direction: column;
}

// 電影片名

// 分級
img.rating {
  @include size(22px);
}
</style>
<script setup lang="ts">

import { r2src } from '@/js/movieRatingSystem.ts'
import type { Movie } from '@/js/movies.ts'
import { ref } from 'vue';

const props = defineProps<{ movie: Movie }>()
const posterFailed = ref(false)
</script>

<template>
  <li class="movie-cell">
    <div class="poster">
      <p v-if="posterFailed" class="poster-failed movie-title">{{ movie.title }}</p>
      <img v-else :src="movie.poster" alt="" @error="posterFailed = true">
    </div>
    <div class="info-cell">
      <p class="movie-title">{{ movie.title }}</p>
      <img class="rating" :src="r2src(movie.movie_rating_system)" :alt="movie.movie_rating_system??''">
    </div>
  </li>
</template>

<style scoped lang="scss">
@use '@/style' as *;

// 電影每格
.movie-cell {
  gap: 12px;
}

// 海報
// 或使用span的display:block,width:auto讓grid將子元素寬度撐滿
div.poster {
  aspect-ratio: 2 / 3; /* 寬度由 grid 算出來，高度 = 寬度 * 1.5 */
  @include flex-center;
  background: var(--placeholder);

  p.poster-failed {
    color: var(--text-dim);

    /* 顯示不下藏起來 */
    @include text-ellipsis;
    padding: 20px;
  }

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
.movie-title {
  line-height: 1.4; /* 蓋過style的1.5 */
  font-weight: 500;
}

// 分級
img.rating {
  @include size(22px);
}
</style>
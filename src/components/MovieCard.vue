<script setup lang="ts">

import { r2src } from '@/js/movieRatingSystem.ts'
import type { Movie } from '@/js/movies.ts'
import { onMounted, ref } from 'vue';
import { fetchMovieVersions } from '@/js/showings.ts'
import { filters } from '@/js/filters.ts'

const props = defineProps<{ movie: Movie }>()
const posterFailed = ref(false)
const runtime = ref('')
const versions = ref<(string | null)[]>([])
onMounted(async () => {
  // runtime 有可能''或undefined，判空條件設 movie.runtime || ''(v-if)
  // version 有可能[]或[''](被getVersion篩選掉了並.trim())，判空條件設 versions.length(v-if)
  runtime.value = props.movie.runtime?.replace(/^\D*(\d+)\D*$/, '$1分鐘') || ''
  versions.value = await fetchMovieVersions(props.movie.id, filters.theater)
})
</script>

<template>
  <li class="movie-cell">
    <div class="poster sheen">
      <p v-if="posterFailed" class="poster-failed movie-title">{{ movie.title }}</p>
      <img v-else :src="movie.poster" alt="" @error="posterFailed = true">
    </div>
    <div class="info-cell">
      <p class="movie-title">{{ movie.title }}</p>
      <div class="meta-cell">
        <img class="rating" :src="r2src(movie.movie_rating_system)" :alt="movie.movie_rating_system??''">
        <span class="runtime" v-if="runtime">{{ runtime }}</span>
      </div>
      <div class="versions-cell" v-if="versions.length">
        <span class="version" v-for="version in versions">{{ version }}</span>
      </div>
    </div>
  </li>
</template>

<style scoped lang="scss">
@use '@/style' as *;

// 電影每格
.movie-cell {
  gap: 12px;
  cursor: pointer;

  &:hover .poster img {
    transform: scale(1.1);
  }
}

// 海報
// 或使用span的display:block,width:auto讓grid將子元素寬度撐滿
div.poster {
  aspect-ratio: 2 / 3; /* 寬度由 grid 算出來，高度 = 寬度 * 1.5 */
  @include flex-center;
  background: var(--placeholder);
  overflow: hidden;
  border-radius: var(--r-md);

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
    transition: 0.5s var(--ease);
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

// 分級+片長
.meta-cell {
  display: flex;
  gap: var(--gap-md);

  // 分級
  img.rating {
    @include size(22px);
  }

  // 片長
  .runtime {
    color: var(--text-dim);
    font-size: 13px;
  }
}

.versions-cell {
  width: 100%;
  @include item-clamp;
  // gap: var(--gap-sm);

  .version {
    margin-right: var(--gap-sm);
    font-size: 11px;
    padding: 1px 5px;
    color: var(--accent-text);
    background: var(--accent-soft);
    border-radius: var(--r-sm);
  }
}
</style>
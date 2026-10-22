<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import dialog, { currentMovieId } from '@/js/dialog.ts'
import {
  fetchMovieShowtimes,
  groupByTheater,
  type ShowTimesRaw,
  type DateShowtimes
} from '@/js/showTimesRaw.ts'
import { Filters, filters } from '@/js/filters.ts'
import { fetchMovie, type Movie } from '@/js/movies.ts'
import { r2src } from '@/js/movieRatingSystem.ts'
import { formatRuntime } from '@/js/format.ts'
import { dateLabel } from '@/js/dates.ts';
import type { Option } from '@/js/Option.ts';

const movieShowtimes = ref<ShowTimesRaw[]>([])
const dateShowtimes = ref<DateShowtimes[]>([])
const theaterShowtimes = computed(() => dateShowtimes.value.find(ds => ds.date === localFilters.date)?.theaters ?? [])
const posterFailed = ref(false)
const movie = ref<Movie>()
const localFilters = reactive<Filters>(new Filters())
const dates = ref<Option[]>([{ value: '', label: '' }])

function onBackdropClick(e: MouseEvent) {
  dialog.closeOnBackdrop(e)
}

watch(currentMovieId, async movieId => {
  if (!movieId) return  // 避免 undefined
  Object.assign(localFilters, filters)
  // 日期改由彈窗 chip 在前端切換（theaterShowtimes computed 依 localFilters.date 過濾顯示），
  // 不把 date 送後端，否則重撈只會回那一天，dateShowtimes 塌成一天、chip 清單只剩一顆
  localFilters.date = ''
  movie.value = await fetchMovie(movieId)
  movieShowtimes.value = await fetchMovieShowtimes(movieId, localFilters)
  dateShowtimes.value = groupByTheater(movieShowtimes.value)
  dates.value = dateShowtimes.value.map(ds => ({ value: ds.date, label: ds.date }))
  localFilters.date = dateShowtimes.value[0]?.date ?? ''  // 預設顯示第一筆日期
})
</script>

<template>
  <dialog :ref="dialog.dialogRef" class="glass-showtimes" @click="onBackdropClick" @close="currentMovieId = undefined">
    <div class="content">
      <header v-if="movie">
        <div class="poster sheen">
          <p v-if="posterFailed" class="poster-failed movie-title">{{ movie.title }}</p>
          <img v-else :src="movie.poster" alt="" @error="posterFailed = true">
        </div>
        <div class="header-info">
          <h2>{{ movie.title }}</h2>
          <div class="meta" v-if="movie.movie_rating_system && movie.runtime">
            <img class="rating-img" :src="r2src(movie.movie_rating_system)" :alt="movie.movie_rating_system??''">
            <span class="rating-text">{{ movie.movie_rating_system }}</span>
            <span class="runtime" v-if="movie.runtime">·{{ formatRuntime(movie.runtime) }}</span>
          </div>
        </div>
      </header>
      <div class="chips" v-if="dates && dates.length > 0">
        <button class="chip small-text"
                v-for="d in dates"
                @click="localFilters.date = d.value"
                :aria-pressed="localFilters.date === d.value">
          {{ dateLabel(d.label) }}
        </button>
      </div>
      <div class="body">
        <div class="theater" v-for="ts in theaterShowtimes">
          <h3>{{ ts.theaterName }}<span>{{ ts.city }}</span></h3>
          <div class="row" v-for="vs in ts.raw">
            <div class="version" v-if="vs.version">{{ vs.version }}</div>
            <div class="times" v-for="time in vs.times">{{ time }}</div>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
@use '@/style' as *;
@use '@/styles/chips' as chips;

dialog {
  position: fixed;
  outline: none;

  .content {
    @include size(100%);
  }
}

header {
  display: flex;
  width: 100%;
  gap: var(--gap-lg);
  padding: 20px 20px 16px 20px;

  .poster {
    width: 64px;
    aspect-ratio: 2 / 3;
    background: var(--placeholder);
    @include flex-center;
    border-radius: var(--r-md);
    overflow: hidden;

    img {
      @include size(100%);
      object-fit: cover; /* 裡面的圖片放大裁切 */
      vertical-align: bottom; /* 去掉inline底下的空隙 */
    }
  }

  .meta, .header-info {
    flex: 1;
  }

  .meta {
    display: flex;
    flex-direction: row;
    gap: var(--gap-md);
    color: var(--text-dim);
    font-size: 13px;

    .rating-img {
      @include size(20px);
    }
  }

  h2 {
    font-size: 22px;
    line-height: 1.3;
    letter-spacing: 0.05em;
    font-weight: bold;
  }
}

.chips {
  @include chips.chips;
}

/* region 動畫 */
/* ※注意※ 必須寫在 @starting-style 之前，否則會蓋掉開啟動畫的起點 */
dialog[open] {
  opacity: 1;
  transform: initial;
}

dialog[open]::backdrop {
  background: rgb(0 0 0 / 0.4);
  backdrop-filter: blur(24px);
}

@mixin dialog-transition {
  transition: .3s var(--ease),
  overlay .3s allow-discrete, /* 關閉動畫播完前，先留在 top layer */
  display .3s allow-discrete;
}

dialog {
  @mixin dialog-hidden {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  @include dialog-transition;
  @include dialog-hidden;

  &[open] {
    @starting-style {
      @include dialog-hidden;
    }
  }
}

dialog::backdrop {
  @mixin backdrop-hidden {
    background: initial;
    backdrop-filter: initial;
  }
  @include dialog-transition;
  @include backdrop-hidden;
  @at-root dialog[open]::backdrop {
    @starting-style {
      @include backdrop-hidden;
    }
  }
}

/* endregion */

/* region RWD */
dialog {
  margin: auto;
  border-radius: var(--r-lg);
  width: min(720px, calc(100% - 32px));
  height: min(820px, 88dvh);

  @media (max-width: 600px) {
    margin: auto 0 0 0; /* 上右下左 */
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    width: 100%;
    max-width: 100%;
  }
}

/* endregion */
</style>
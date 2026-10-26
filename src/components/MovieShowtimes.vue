<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import dialog, { currentMovieId } from '@/js/state/dialog.ts'
import {
  fetchMovieShowtimes,
  groupByTheater,
  type Showtimes,
  type DateShowtimes
} from '@/js/api/showtimes.ts'
import { Filters, filters } from '@/js/filters/filters.ts'
import { fetchMovie, type Movie } from '@/js/api/movies.ts'
import { r2src } from '@/js/utils/rating.ts'
import { formatRuntime, fullColon2half } from '@/js/utils/format.ts'
import { dateLabel } from '@/js/utils/dates.ts'
import type { Option } from '@/js/filters/Option.ts'
import { isTracked, track, untrack } from '@/js/state/tracks.ts'
import { getEmail } from '@/js/state/subscriber.ts'

const movieShowtimes = ref<Showtimes[]>([])
const dateShowtimes = ref<DateShowtimes[]>([])
const theaterShowtimes = computed(() => dateShowtimes.value.find(ds => ds.date === localFilters.date)?.theaters ?? [])
const posterFailed = ref(false)
const movie = ref<Movie>()
const localFilters = reactive<Filters>(new Filters())
const dates = ref<Option[]>([{ value: '', label: '' }])

// region 上映通知
const emailInput = ref(getEmail())
const notifyBusy = ref(false)
const notifyMsg = ref('')
const tracked = computed(() => (movie.value ? isTracked(movie.value.id) : false))
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

async function onTrack() {
  if (!movie.value) return
  const email = emailInput.value.trim()
  if (!EMAIL_RE.test(email)) {
    notifyMsg.value = '請輸入正確的 Email'
    return
  }
  notifyBusy.value = true
  notifyMsg.value = ''
  try {
    await track(movie.value.id, email)
    notifyMsg.value = '設定成功！上映前會寄信通知你'
  } catch {
    notifyMsg.value = '設定失敗，請稍後再試'
  } finally {
    notifyBusy.value = false
  }
}

async function onUntrack() {
  if (!movie.value) return
  notifyBusy.value = true
  notifyMsg.value = ''
  try {
    await untrack(movie.value.id)
    notifyMsg.value = '已取消通知'
  } catch {
    notifyMsg.value = '取消失敗，請稍後再試'
  } finally {
    notifyBusy.value = false
  }
}
// endregion

function onBackdropClick(e: MouseEvent) {
  dialog.closeOnBackdrop(e)
}

watch(currentMovieId, async movieId => {
  if (!movieId) return  // 避免 undefined
  // 換一部電影時重置通知區塊狀態（email 保留使用者上次填的）
  emailInput.value = getEmail()
  notifyMsg.value = ''
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
          <!-- 上映通知：填 email 追蹤，上映前後端會寄信 -->
          <div class="notify">
            <div class="notify-row" v-if="tracked">
              <span class="notify-on">🔔 上映前會寄信通知你</span>
              <button class="notify-cancel" :disabled="notifyBusy" @click="onUntrack">取消通知</button>
            </div>
            <div class="notify-row" v-else>
              <input class="notify-email" type="email" inputmode="email"
                     v-model="emailInput" placeholder="你的 Email" @keyup.enter="onTrack">
              <button class="notify-btn" :disabled="notifyBusy" @click="onTrack">通知我上映</button>
            </div>
            <p class="notify-msg" v-if="notifyMsg">{{ notifyMsg }}</p>
          </div>
        </div>
      </header>
      <div class="time-chips" v-if="dates && dates.length > 0">
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
          <div class="row" v-for="vs in ts.rows">
            <span class="version" v-if="vs.version">{{ vs.version }}</span>
            <ul class="times">
              <li v-for="time in vs.times">{{ fullColon2half(time) }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
@use '@/style' as *;
@use '@/styles/chips' as chips;
@use '@/styles/version';
@use "@/styles/poster";

dialog {
  overflow-y: hidden; /* 隱藏自己的滾動軸 */
  position: fixed;
  outline: none;

  .content {
    @include size(100%);
    display: flex; /* 使 flex: 1 有效 */
    flex-direction: column;
  }
}

header {
  display: flex;
  width: 100%;
  gap: var(--gap-lg);
  padding: 20px 20px 16px 20px;

  .poster {
    @include poster.poster;
    width: 64px;
  }

  .meta, .header-info {
    flex: 1;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
  }

  h2 {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.05em;
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
}

/* 上映通知區塊 */
.notify {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .notify-row {
    display: flex;
    gap: var(--gap-md);
    align-items: center;
    flex-wrap: wrap;
  }

  .notify-email {
    flex: 1;
    min-width: 140px;
    height: 34px;
    padding: 0 12px;
    border-radius: var(--pill);
    border: 1px solid var(--line-strong);
    background: var(--fill);
    font-size: 14px;
  }

  .notify-btn, .notify-cancel {
    height: 34px;
    padding: 0 16px;
    border-radius: var(--pill);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: 0.2s var(--ease);
    white-space: nowrap;

    &:active {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .notify-btn {
    color: #fff;
    background: var(--text);
    border: none;
  }

  .notify-cancel {
    color: var(--text-dim);
    background: var(--fill);
    border: 1px solid var(--line-strong);
  }

  .notify-on {
    font-size: 14px;
    color: var(--text);
  }

  .notify-msg {
    font-size: 12px;
    color: var(--text-dim);
  }
}

.time-chips {
  @include chips.chips;
  overflow-x: auto;
  scrollbar-width: thin;
  padding: 0 20px 8px 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap; /* 元素不換行 */
  width: 100%;

  > * {
    flex-shrink: 0; /* 元素不壓縮 */
    white-space: nowrap; /* 文字不換行 */
  }
}

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  padding: 8px 20px 24px;

  .theater {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
    padding: 16px 0;
    border-bottom: 1px solid var(--line);

    /* 影城名稱 */
    h3 {
      font-weight: 500;
    }

    /* 廳型+時間表 */
    .row {
      @include flex-align-center;

      span.version {
        @include version.version(2px 10px);
        height: fit-content;
      }

      /* 時間表 */
      ul {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--gap-md);
        list-style: none;

        li {
          padding: 4px 12px;
          border-radius: var(--pill);
          border: 1px solid var(--line-strong);
          font-size: 14px;
          font-variant-numeric: tabular-nums; /* 數字等寬、類似mono */
        }
      }
    }
  }
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
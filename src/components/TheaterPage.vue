<script setup lang="ts">
import { onMounted, watch } from 'vue'
import {
  start,
  update,
  dateOptions,
  filtersForTheaterPage,
  facetForTheaterPage,
  showtimesUI,
  r2src,
  theater,
} from '@/js/state/theaterPageDatasLifecycle.ts'
import { withDisabled } from '@/js/filters/facetDisabledForTheaterPage.ts'
import { isEmpty } from '@/js/utils/isEmpty.ts'
import Poster from '@/components/Poster.vue'
import { formatRuntime, fullColon2half } from '@/js/utils/format.ts'
import { switchTab } from '@/js/state/activeTab.ts'
import data from '@/js/state/cityPageDatasLifecycle.ts'

onMounted(start)
watch(filtersForTheaterPage, update)
const switchAndCitySelected = (city: string) => {
  data.onClickCity(city)
  switchTab('影城地圖')
}
</script>

<template>
  <div class="page">
    <main>
      <nav>
        <a @click="switchTab('影城地圖')">影城地圖</a>
        <img src="@/assets/chevron-right.svg" alt="">
        <a @click="switchAndCitySelected(theater?.city ?? '')">{{ theater?.city }}</a>
      </nav>
      <h1>{{ theater?.name }}</h1>
      <fieldset class="field" v-if="!isEmpty(dateOptions)">
        <div class="time-chips">
          <button class="chip small-text"
                  v-for="d in withDisabled(dateOptions ?? [], 'date', facetForTheaterPage)"
                  @click="filtersForTheaterPage.date = d.value"
                  :aria-pressed="filtersForTheaterPage.date === d.value"
                  :disabled="d.disabled">
            {{ d.label }}
          </button>
        </div>
      </fieldset>
      <ul class="list">
        <li v-for="ui in showtimesUI" class="block">
          <!-- 左海報 -->
          <Poster :src="ui.poster" :place-holder="ui.movieName"/>
          <!-- 右邊該電影資訊、當天時刻表 -->
          <div class="info">
            <div class="title-row"><h2>{{ ui.movieName }}</h2></div>
            <div class="meta">
              <img :src="r2src(ui.rating)" alt="ui.rating" class="rating"/>
              <span>{{ formatRuntime(ui.runtime) }}</span>
            </div>
            <div class="row" v-for="version in ui.versions">
              <span v-if="version.version" class="version">{{ version.version }}</span>
              <ul class="times">
                <li v-for="time in version.times" class="time">{{ fullColon2half(time) }}</li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
@use "@/styles/chips";
@use "@/styles/version";

main {
  margin: 0 auto ;
  padding-top: 32px;
  padding-bottom: 80px;
}

nav {
  gap: 6px;
  @include flex-align-center;

  img {
    @include size(12px);
  }

  a {
    font-size: 13px;
    font-weight: 400;
    color: var(--text-dim);
    text-decoration: none;

    &:hover {
      color: var(--text);
      text-decoration: underline;
    }
  }
}

h1 {
  margin-top: 12px;
  margin-bottom: 20px;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 700;
  line-height: 1.2;
}

fieldset .time-chips {
  @include chips.chips;
}

.list {
  gap: var(--gap-lg);
  display: grid;

  .block {
    gap: 20px;
    display: flex;
    padding: 16px;
    border-radius: var(--r-lg);
    border: 1px solid rgb(255 255 255 / 0.8);
    background: rgb(255 255 255 / 0.55);
    box-shadow: 0 14px 32px -28px var(--shadow);
  }

  .info {
    gap: var(--gap-md);
    display: flex;
    flex-direction: column;

    h2 {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.4;
      letter-spacing: 0.05em;
    }

    .meta {
      gap: var(--gap-md);
      @include flex-align-center;
      flex-wrap: wrap; /* 自動換行 */

      img {
        @include size(20px);
      }

      span {
        font-size: 13px;
        color: var(--text-dim);
        font-variant-numeric: tabular-nums;
      }
    }

    .row, .times {
      gap: 6px;
      @include flex-align-center;
      flex-wrap: wrap;
    }

    .row {
      .version {
        @include version.version(2px 10px);
      }

      .times {
        gap: 6px;

        .time {
          padding: 3px 11px;
          border-radius: var(--pill);
          border: 1px solid var(--line-strong);
          background: var(--surface-solid);
          font-size: 14px;
          font-variant-numeric: tabular-nums;
        }
      }
    }
  }
}

/* region RWD */
main {
  width: min(1300px, calc(100% - 200px));
}

.list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1000px) {
  main {
    width: min(1300px, calc(100% - 48px));
  }
  .list {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* endregion */
</style>
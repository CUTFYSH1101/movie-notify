<script setup lang="ts">
import { onMounted, watch } from 'vue'
import {
  start,
  update,
  dateOptions,
  filtersForTheaterPage,
  facetForTheaterPage,
  showtimesUI,
  r2src
} from '@/js/state/theaterPageDatasLifecycle.ts'
import { withDisabled } from '@/js/filters/facetDisabledForTheaterPage.ts'
import { isEmpty } from '@/js/utils/isEmpty.ts'
import Poster from '@/components/Poster.vue'
import { formatRuntime, fullColon2half } from '@/js/utils/format.ts'

onMounted(start)
watch(filtersForTheaterPage, update)
</script>

<template>
  <div class="page">
    <main>
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
        <li v-for="ui in showtimesUI">
          <Poster :src="ui.poster" :place-holder="ui.movieName"/>
          <div class="info">
            <div class="title-row"><h2>{{ ui.movieName }}</h2></div>
            <div class="meta">
              <img :src="r2src(ui.rating)" alt="ui.rating" class="rating"/>
              <span>{{ formatRuntime(ui.runtime) }}</span>
            </div>
            <div class="row" v-for="version in ui.versions">
              <span v-if="version.version" class="version">{{ version.version }}</span>
              <ul class="times">
                <li v-for="time in version.times">{{ fullColon2half(time) }}</li>
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

fieldset .time-chips {
  @include chips.chips;
}

.list {
  .info {
    img {
      @include size(20px);
    }
  }
}
</style>
<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'
import { glassUi } from '@/js/ui/glass.ts'
import { filters, filters_get_set, withAlls } from '@/js/filters/filters.ts'
import options from '@/js/filters/filtersOptions.ts'
import { withDisabled, withVisibility } from '@/js/filters/filtersFacetDisabled.ts'
import { facets, moviesOptions } from '@/js/state/datasLifecycle.ts'
import { dateLabel } from '@/js/utils/dates.ts'
import { start } from '@/js/filters/filtersOptions.ts'

const open = ref(false)
const currentRating = computed(() => options.ratings.find(r => r.value === filters.rating))
onMounted(start)
</script>

<template>
  <div class="dock" :class="{'dock-close': !open}">
    <button class="toggle glass" @click="open = !open">
      <img src="@/assets/filter_20dp.svg" alt="篩選">
      <span>篩選</span>
    </button>
    <aside class="panel glass-panel" :inert="!open">
      <header>
        <h2>篩選電影</h2>
        <button class="text-btn small-text" @click="filters.reset" :disabled="filters.allDefault()">清除全部</button>
      </header>
      <div class="fields">
        <!-- region 日期 -->
        <fieldset class="field" v-if="options.dates && options.dates.length > 0">
          <legend>日期</legend>
          <div class="time-chips">
            <button class="chip small-text"
                    v-for="d in withDisabled(options.dates, 'date', facets)"
                    @click="filters.date = d.value"
                    :aria-pressed="filters.date === d.value"
                    :disabled="d.disabled">
              {{ dateLabel(d.label) }}
            </button>
          </div>
        </fieldset>
        <!-- endregion -->
        <!-- region 影城 -->
        <div class="field">
          <label>影城</label>
          <!--跟電影名稱一樣用 mode="autocomplete"，filters.theater 存的是輸入的文字（影城名稱關鍵字）-->
          <!--輸入'秀'就會篩出名稱有'秀'的所有影城，所以不需要'不限'選項，清空輸入框就是不限-->
          <UInputMenu
              v-model="filters.theater"
              :items="withVisibility(options.theaters.filter(t => t.value), 'theater', facets)"
              label-key="label"
              value-key="label"
              :ui="glassUi"
              :content="{hideWhenEmpty: true, sideOffset: 0, bodyLock: true}"
              placeholder="例如：大遠百、威秀"
              mode="autocomplete"
              open-on-focus/>
        </div>
        <!-- endregion -->
        <!-- region 電影名稱 -->
        <div class="field">
          <label>電影名稱</label>
          <!--要做到「邊打字邊篩選」，得讓 v-model 綁的是輸入框的文字，也就是 mode="autocomplete"-->
          <!--注意Nuxt UI不能接受value為''的選項，必須寫個詞彙例如'all'-->
          <!--由於movie.title是在前端篩選，不需考慮value='all'送入後端變成查不到資料-->
          <UInputMenu
              v-model="filters.movie"
              :items="moviesOptions"
              label-key="title"
              value-key="title"
              :ui="glassUi"
              :content="{hideWhenEmpty: true, sideOffset: 0, bodyLock: true}"
              placeholder="例如：柯南"
              mode="autocomplete"
              open-on-focus/>
        </div>
        <!-- endregion -->
        <!-- region 廳型 -->
        <div class="field">
          <label>廳型</label>
          <USelect
              v-model="filters_get_set.version"
              :items="withVisibility(withAlls(options.versions), 'version', facets)"
              :ui="glassUi"
              :content="{sideOffset: 0}"/>
        </div>
        <!-- endregion -->
        <!-- region 電影分級 -->
        <div class="field">
          <label>電影分級</label>
          <!--padding-start-->
          <!--ps-11 是 44px，大約是 leading 原本的左側內距 10px + 圖片 26px + 8px 間隔-->
          <USelect
              class="ps-11"
              v-model="filters_get_set.rating"
              :items="withDisabled(withAlls(options.ratings), 'rating', facets)"
              :ui="glassUi"
              :content="{sideOffset: 0}">
            <!-- 選中的 -->
            <template #leading class="flex gap-1">
              <img v-if="currentRating?.img" :src="currentRating?.img" width="26" alt=""/>
              <span></span>
            </template>
            <template #item-leading="{ item }">
              <img v-if="item?.img" :src="item?.img" width="26" alt=""/>
              <!-- 讓沒有圖示的"不限"跟有圖示的對齊 -->
              <span v-else class="w-[26px] shrink-0"/>
            </template>
          </USelect>
        </div>
        <!-- endregion -->
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
@use '@/style' as *;
@use '@/styles/chips' as chips;

.dock {
  @include fixed-right-top-bottom(84px, 16px);
  transition: var(--ease) 0.2s;

  &.dock-close {
    transform: translateX(100%);
  }
}

button.toggle {
  gap: 8px;

  /* 位置、裡面的東西置中 */
  /* position, right, top, bottom, display, jcc, aic */
  @include abs-left-center-outside;
  @include flex-center;
  flex-direction: column;

  border-radius: var(--r-lg) 0 0 var(--r-lg);

  /* width, height */
  padding: 14px 0;
  width: 46px;

  /* region 動畫 */
  transition: var(--ease) 0.2s;

  &:hover {
    background: rgb(255 255 255 / 0.85);
  }

  /* endregion */

  span {
    writing-mode: vertical-rl;
    font-size: 14px;
    font-weight: 500;
  }
}

.panel {
  width: min(360px, calc(100vw - 64px));
  height: 100%;
  border-radius: var(--r-lg) 0 0 var(--r-lg);

  /* 超出隱藏並且有滾動軸，提供給 .fields 有 flex 屬性 */
  display: flex;
  flex-direction: column;
}

/* 子元件寬度填滿.panel */
.fields > *, .field > *, header {
  width: 100%;
}

.panel header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 22px 22px 14px 22px;
  border-bottom: 1px solid var(--line);

  h2 {
    font-size: 20px;
    font-weight: 700;
  }

  .text-btn {
    height: 30px;
    padding: 0 10px;
    border-radius: var(--pill);
    border: 1px solid var(--line-strong);
    background: var(--surface-solid);
  }
}

.panel .fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 18px 22px;

  /* 超出隱藏並且有滾動軸 */
  min-height: 0;
  flex: 1;
  overflow-y: auto;
}

.panel .field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel fieldset .time-chips {
  @include chips.chips;
}

.small-text {
  font-size: 13px;
}
</style>
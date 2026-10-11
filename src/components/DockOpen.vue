<script setup lang="ts">

import { computed, ref } from 'vue';
import { glassUi } from '@/js/ui/glass.ts'
import options from '@/js/filterOptions.ts'
import { dateLabel } from '@/js/dates.ts'
import { filters, filters_get_set, withAlls } from '@/js/filters.ts'


const open = ref(false)


const currentRating = computed(() => options.ratings.find(r => r.value === filters.rating))


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
        <button class="text-btn small-text" @click="filters.reset">清除全部</button>
      </header>
      <div class="fields">
        <fieldset class="field" v-if="options.dates && options.dates.length > 0">
          <legend>日期</legend>
          <div class="chips">
            <button class="chip small-text"
                    v-for="d in options.dates"
                    @click="filters.date = d.value"
                    :aria-pressed="filters.date === d.value">
              {{ dateLabel(d.label) }}
            </button>
          </div>
        </fieldset>
        <div class="field">
          <label>影城</label>
          <UInputMenu
              v-model="filters_get_set.theater"
              :items="withAlls(options.theaters)"
              label-key="label"
              value-key="value"
              :ui="glassUi"
              :content="{hideWhenEmpty: true, sideOffset: 0, bodyLock: true}"
              placeholder="例如：大遠百、威秀"
              open-on-focus/>
        </div>
        <div class="field">
          <label>電影分級</label>
          <USelect
              v-model="filters_get_set.rating"
              :items="withAlls(options.ratings)"
              :ui="glassUi"
              :content="{sideOffset: 0}">
            <!-- 選中的 -->
            <template #leading>
              <img v-if="currentRating?.img" :src="currentRating?.img" width="26" alt=""/>
            </template>
            <template #item-leading="{ item }" class="flex gap-1">
              <img v-if="item?.img" :src="item?.img" width="26" alt=""/>
              <!-- 讓沒有圖示的"不限"跟有圖示的對齊 -->
              <span v-else class="w-[26px] shrink-0"/>
            </template>
          </USelect>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
@use '@/style' as *;

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
}

.panel .field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel fieldset .chips {
  display: flex;
  gap: 6px;

  .chip {
    height: 36px;
    padding: 0 14px;
    border: 1px solid var(--line-strong);
    background: var(--surface-solid);
    border-radius: var(--pill);
    transition: var(--ease) 0.2s;
  }

  .chip[aria-pressed='true'] {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 500;
  }
}

.small-text {
  font-size: 13px;
}
</style>
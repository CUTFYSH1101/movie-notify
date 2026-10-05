<script setup lang="ts">

import { ref } from 'vue';
import { glassUi } from '@/js/ui/glass.ts'

const open = ref(false)

const theaters = ['MUVIE CINEMAS台北松仁威秀', '台北信義威秀', '台北南港LaLaport威秀影城', '大巨蛋秀泰影城', '親親戲院']
const theater = ref('')

const ratings = ['不限', '普遍級', '保護級', '輔12級', '輔15級', '限制級']
const rating = ref('不限')

function resetFilter() {
  theater.value = ''
  rating.value = '不限'
}
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
        <button class="text-btn" @click="resetFilter">清除全部</button>
      </header>
      <div class="field">
        <UInputMenu
            v-model="theater"
            :items="theaters"
            :ui="glassUi"
            :content="{hideWhenEmpty: true, sideOffset: 0, bodyLock: true}"
            placeholder="例如：大遠百、威秀"
            mode="autocomplete"
            open-on-focus/>
        <USelect
            v-model="rating"
            :items="ratings"
            :ui="glassUi"
            :content="{sideOffset: 0}"/>
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
.field > *, header {
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
    font-size: 13px;
  }
}

.panel .field {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 18px 22px;
}
</style>
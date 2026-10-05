<script setup lang="ts">

import { ref } from 'vue';
import { glassUi } from '@/js/ui/glass.ts'

const open = ref(false)

const theaters = ['MUVIE CINEMAS台北松仁威秀', '台北信義威秀', '台北南港LaLaport威秀影城', '大巨蛋秀泰影城', '親親戲院']
const theater = ref('')

const ratings = ['不限', '普遍級', '保護級', '輔12級', '輔15級', '限制級']
const rating = ref('不限')
</script>

<template>
  <div class="dock" :class="{'dock-close': !open}">
    <button class="toggle glass" @click="open = !open">篩選</button>
    <aside class="panel glass-panel" :inert="!open">
      <UInputMenu
          v-model="theater"
          :items="theaters"
          :ui="glassUi"
          :content="{hideWhenEmpty: true, sideOffset: 0, bodyLock: true}"
          placeholder="例如：大遠百、威秀"
          mode="autocomplete"
          open-on-focus/>
      <br>
      <USelect
          v-model="rating"
          :items="ratings"
          :ui="glassUi"
          :content="{sideOffset: 0}"/>
    </aside>
  </div>
</template>

<style scoped lang="scss">
@use '@/style' as *;

.dock {
  @include fixed-right-top-bottom(84px, 16px);
  transition: var(--ease) 0.1s;
}

.dock-close {
  transform: translateX(100%);
}

button.toggle {
  @include abs-left-center-outside;
  cursor: pointer;
}

.panel {
  width: min(360px, calc(100vw - 64px));
  height: 100%;
  padding: 20px;
  border-radius: var(--r-lg) 0 0 var(--r-lg);

  /* 子元件寬度填滿.panel */
  & > * {
    width: 100%;
  }
}
</style>
<script setup lang="ts">
import type { Theater } from '@/js/api/theaters.ts'
import { switchTab as superSwitchTab } from '@/js/state/activeTab.ts'
import { theaterId } from '@/js/state/theaterPageDatasLifecycle.ts'

const props = defineProps<{ theaters: Theater[] | undefined }>()
const switchTab = (theaterId_: string) => {
  theaterId.value = theaterId_
  superSwitchTab('影城電影')
}

</script>

<template>
  <ul class="theaters">
    <li v-for="theater in theaters" class="theater" @click="switchTab(theater.id)">
      <p>{{ theater.name }}</p>
      <img src="@/assets/chevron-right.svg" :alt="`${theater.name}所播放的電影`"/>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use "@/style" as *;
@use "@/styles/button";

.theaters {
  gap: 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  .theater {
    @include flex-align-center;
    @include button.secondary; /* 自帶:hover亮橘邊 */
    justify-content: space-between;
    padding: 10px 24px 10px 14px;
    height: fit-content; /* 大小 */
    min-height: 48px;
    border-radius: var(--r-md); /* 形狀 */
    border: 1px solid white;
    background: #FAFAFA;
    box-sizing: border-box; /* 避免 border 占掉 height */
    cursor: pointer;

    p {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0; /* 用來偷偷減少寬度 */
    }

    img {
      @include size(18px);
    }

    /* region 動畫 */
    &, img { /* 相當於 `.theater, .theater img` */
      transition: 0.3s var(--ease);
    }

    &:hover {
      filter: brightness(1.05);

      img {
        transform: translateX(10px);
      }
    }

    /* endregion */
  }
}
</style>
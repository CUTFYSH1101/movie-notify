<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ src: string, placeHolder: string }>()
const posterFailed = ref<boolean>(false)
</script>

<template>
  <div class="poster sheen">
    <p v-if="posterFailed" class="poster-failed movie-title">{{ placeHolder }}</p>
    <img v-else :src="src" alt="" @error="posterFailed = true">
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
@use "@/styles/poster";

.poster {
  @include poster.poster;
  width: 96px;
  /* region 避免變形 */
  /* flex 容器的 align-items 預設值是 stretch */
  /* 每個 flex 子項（海報、右側 .info）都會被拉伸到跟「整個 block 最高的那項」一樣高 */
  flex-shrink: 0;
  flex-grow: 0;
  align-self: flex-start;
  /* endregion */

  box-shadow: 0 0 0 rgba(200, 200, 200, 0.5);
  transition: 0.5s var(--ease);
  cursor: pointer;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 10px rgba(200, 200, 200, 0.5);
  }
}
</style>
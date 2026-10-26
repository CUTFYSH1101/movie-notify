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
@use "@/styles/poster";

.poster {
  @include poster.poster;
  width: 96px;
}
</style>
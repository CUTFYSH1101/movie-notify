<script setup lang="ts">
import Header_ from '@/components/Header_.vue'
import { activeTab, activeComponent } from '@/js/state/activeTab.ts'

</script>

<template>
  <UApp :scroll-body="false">
    <Header_/>
    <Transition name="slide-up" mode="out-in">
      <component :is="activeComponent" :key="activeTab"/>
    </Transition>
  </UApp>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(24px); /* 從下方滑上來 */
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-12px); /* 舊頁面往上淡出 */
}
</style>

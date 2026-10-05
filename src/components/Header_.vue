<script setup lang="ts">

</script>

<template>
  <header>
    <a class="brand" href="#">
      <img src="/favicon.svg" alt="影訊">
      <span class="app-name">影訊</span>
    </a>
  </header>
</template>

<style scoped lang="scss">
@use '@/style' as *;

a.brand {
  @include flex-align-center;

  img {
    @include size(22px);
  }
}
</style>
<script setup lang="ts">
import { fetchMovies } from '@/js/movies.ts'
</script>

<template>
  <button @click="console.log(fetchMovies())">載入電影</button>
</template>

<style scoped>

</style>
<script setup lang="ts">
import {  onMounted } from 'vue'
import dialog from '@/js/dialog.ts'

onMounted(dialog.open)
function onBackdropClick(e: MouseEvent) {
  dialog.onBackdropClick(e)
}
</script>

<template>
  <dialog :ref="dialog.dialogRef" class="glass-showtimes" @click="onBackdropClick">
    <div class="content">
      hello
    </div>
  </dialog>
</template>

<style scoped lang="scss">
@use '@/style' as *;

dialog {
  position: fixed;
  outline: none;

  /* 背景效果，不用 @apply 因為還要加上 @reference 而且實際只有套用 `backdrop-blur-2xl` */
  &::backdrop {
    background: rgb(0 0 0 / 0.4);
    backdrop-filter: blur(24px);
  }

  .content {
    @include size(100%);
  }
}

dialog {
  margin: auto;
  border-radius: var(--r-lg);
  width: min(720px, calc(100% - 32px));
  height: min(820px, 88dvh);

  @media (max-width: 600px) {
    margin: auto 0 0 0; /* 上右下左 */
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    width: 100%;
    max-width: 100%;
  }
}
</style>
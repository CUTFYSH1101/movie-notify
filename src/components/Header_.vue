<script setup lang="ts">
import { computed } from 'vue'
import { isTab, switchTab } from '@/js/state/activeTab.ts'
import { trackedIds } from '@/js/state/tracks.ts'


const badge = computed(() => trackedIds.value.size) // 關注（追蹤通知）電影數
</script>

<template>
  <!-- header.navbar > .left(a.brand+nav.page-buttons)+.right(nav.function-buttons)-->
  <header class="navbar glass">
    <div class="left">
      <!--.left a.brand-->
      <a class="brand" href="#">
        <img src="/favicon.svg" alt="影訊">
        <span class="app-name">影訊</span>
      </a>
      <!--.left nav.page-buttons-->
      <nav class="page-buttons">
        <div :class="{on: isTab('首頁')}" @click="switchTab('首頁')">首頁</div>
        <div :class="{on: isTab('上映中電影')}" @click="switchTab('上映中電影')">上映中電影</div>
        <div :class="{on: isTab('影城地圖')}" @click="switchTab('影城地圖')">影城地圖</div>
      </nav>
    </div>
    <div class="right">
      <nav class="function-buttons">
        <button class="secondary">
          <img src="@/assets/favorite_20dp.svg" alt="">
          <span class="label">關注電影</span>
          <span class="badge" v-if="badge >= 1"></span>
        </button>
        <button class="primary">
          <img src="@/assets/person_20dp.svg" alt="">
          <span class="label">登入 | 註冊</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/style' as *;
@use "@/styles/button";

// 導覽列
header.navbar {
  /* 寬|高|位置|本體置中 */
  z-index: 999; /* 疊在所有圖層上 */
  position: sticky;
  top: 0;
  height: 68px;
  margin: 0 auto; /* 水平置中 */

  /* 裡面的物件.left+.right怎麼排列 */
  @include flex-align-center;
  justify-content: space-between;

  overflow-x: auto; /* 左右滾動軸 */

  border-radius: 0 0 var(--r-lg) var(--r-lg);
  box-shadow: 0 5px 30px rgba(214, 214, 214, 0.6);

  /* region 滾動條樣式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
  /* endregion */
}

.left, .right {
  flex-shrink: 0;
}

.center {
  flex: 1; /* 包含 flex-shrink: 1 可被擠壓，且占滿中間剩餘空間 */
  min-width: 0;
  @include text-ellipsis;
}

.left {
  @include flex-align-center;

  // 左側品牌
  a.brand {
    @include flex-align-center(var(--gap-md));

    img {
      @include size(26px);
    }
  }

  // 左側導覽列
  nav.page-buttons {
    @include flex-align-center;

    > div {
      @include flex-center; /* 文字置中 */

      /* 尺寸 */
      height: 36px;
      padding: 0 12px;

      border-radius: var(--pill);
      cursor: pointer;

      color: var(--text-dim);
      transition: 0.2s var(--ease);

      &:hover {
        color: var(--text);
        background: var(--fill);
      }

      &.on {
        color: var(--text);
        background: var(--fill-strong);
        font-weight: 500;
      }
    }
  }
}

.right {
  // 右側導覽列
  nav.function-buttons {
    @include flex-align-center(var(--gap-md));

    button {
      @include flex-center(var(--gap-md)); /* 文字置中 */
      flex-wrap: nowrap;
      border-radius: var(--r-md);
      transition: 0.2s var(--ease);

      &:active {
        transform: scale(0.95);
      }
    }

    button.primary {
      @include button.primary;
    }

    button.secondary {
      @include button.secondary;
    }
  }
}

/* region RWD */
header.navbar {
  width: min(1320px, calc(100% - 24px));
  padding: 0 12px 0 24px; /* 上右下左 */
}

.left {
  gap: var(--gap-lg);

  nav.page-buttons {
    gap: var(--gap-sm);
  }
}

.right nav.function-buttons button {
  height: 44px;
  padding: 0 14px;
}

/* 900px以下隱藏右側按鈕文字 */
@media (max-width: 900px) {
  .right nav.function-buttons button {
    width: 44px;
    padding: initial;

    .label {
      display: none;
    }
  }
}

/* ※約在此處觸發<Header_>橫向滾動軸 */

/* 520px以下隱藏左側LOGO文字 */
@media (max-width: 520px) {
  .left {
    a.brand .app-name {
      display: none;
    }

    nav.page-buttons {
      gap: 0;
    }
  }
}

@media (max-width: 470px) {
  header.navbar {
    width: 100%;
    padding: 0 10px 0 16px;
  }

  .left {
    gap: var(--gap-md);

    nav.page-buttons {
      font-size: 14px;
      letter-spacing: initial;

      > div {
        padding: 0 8px;
      }
    }
  }
}

/* endregion */

/* region 調整滾動條出現時的版面位置 */
/* 因為滾動條會佔用空間，導致內容看起來沒有垂直置中 */
/* 把元素往下移動，補5px */
/* 當 navbar 可以水平滾動時，就會套用這個設定 */
/* ※實際觸發點大概在 @media (max-width: 580px) */
header.navbar {
  /* Suppress for statement */
  //noinspection CssInvalidPropertyValue
  container-type: scroll-state;
}

@container scroll-state(scrollable: x) {
  header.navbar > * {
    transform: translateY(5px);
  }
}

/* endregion */
</style>
<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('首頁')
const isTab = (tab: string) => activeTab.value == tab;
const switchTab = (tab: string) => activeTab.value = tab;
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
        <button>
          <img src="@/assets/favorite_20dp.svg" alt="">
          <span class="label">喜歡的電影</span>
        </button>
        <button>
          <img src="@/assets/person_20dp.svg" alt="">
          <span class="label">登入 | 註冊</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/style' as *;
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
  border: 1px solid black;

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
      @include flex-align-center(var(--gap-md));
      flex-wrap: nowrap;
    }
  }
}

/* region RWD */
header.navbar {
  width: min(1320px, calc(100% - 24px));
}

.left {
  gap: var(--gap-lg);

  nav.page-buttons {
    gap: var(--gap-sm);
  }
}

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
/* 實際觸發點大概在 @media (max-width: 580px) */
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
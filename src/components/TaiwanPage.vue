<script setup lang="ts">
// @ts-expect-error 找不到 JSON 模組的型別宣告，忽略這行錯誤
import taiwan from '@assets/taiwan-map.json'
import Header_ from '@/components/Header_.vue'
import { computed, onMounted, ref } from 'vue'
import data from '@/js/state/cityPageDatasLifecycle.ts'
import { cityDatas, activeCity } from '@/js/state/cityPageDatasLifecycle.ts'
import type { CityDataKey } from '@/js/api/cityDatas.ts'

const hoverOrActiveCity = computed(() => hoveredCity.value ?? activeCity.value)
const orderedCities = computed(() => (
    [...taiwan.pieces].sort((a, b) => {
      let [ao, bo] = [0, 0]
      if (a.shortName === hoveredCity.value) ao = 1
      if (a.shortName === activeCity.value) ao = 2
      if (b.shortName === hoveredCity.value) bo = 1
      if (b.shortName === activeCity.value) bo = 2
      return ao - bo
    })
))
const theaters = computed(() => data.getCityTheaters(activeCity.value))
const versions = computed(() => {
  let v = data.getCityVersions(hoverOrActiveCity.value)
  v = v.filter(v => v)  // 清除 '' 一般場
  return v?.slice(0, Math.min(10, v.length)).join('、') ?? ''
})

// region hover 相關
const hoveredCity = ref<string | null>(null)

function setHovered(city: string | null) {
  hoveredCity.value = city
}

// endregion

// region colorLerp 切換相關
const activeColorLerp = ref<CityDataKey>('movieCount')

function setColorLerp(value: CityDataKey) {
  activeColorLerp.value = value
}

// endregion

onMounted(data.start)
</script>

<template>
  <Header_/>
  <main>
    <header>
      <h1>影城地圖</h1>
    </header>
    <div class="layout">
      <div class="map-box">
        <div>
          <button @click="setColorLerp('theaterIds')">影城數</button>
          <button @click="setColorLerp('movieCount')">上映電影</button>
          <button @click="setColorLerp('versions')">廳型豐富度</button>
        </div>
        <svg
            class="taiwan-map"
            :viewBox="`0 0 ${taiwan.width} ${taiwan.height}`">
          <!-- 縣市輪廓 -->
          <path
              v-for="piece in orderedCities" :key="piece.city"
              :d="piece.d"
              class="city"
              :class="{active: activeCity == piece.shortName}"
              :style="{fill: data.colorLerp(activeColorLerp, piece.shortName).toCss()}"
              @mouseenter="setHovered(piece.shortName)"
              @mouseleave="setHovered(null)"
              @click="data.onClickCity(piece.shortName)"/>

          <!-- 縣市名稱 -->
          <text
              v-for="piece in orderedCities" :key="piece.city"
              :x="piece.centroid[0]"
              :y="piece.centroid[1]"
              class="city-label"
              :class="{active: activeCity == piece.shortName}">
            {{ piece.shortName }}
          </text>
        </svg>
      </div>
      <aside class="side">
        <!-- TODO 右側內容 -->
        <div v-if="!hoverOrActiveCity" class="detail">
          <h2>全部縣市</h2>
        </div>
        <div v-else class="detail">
          <h2>{{ hoverOrActiveCity }}</h2>
          <p>
            {{ data.getCityTheatersCount(hoverOrActiveCity) }} 間影城·{{ data.getCityMovieCount(hoverOrActiveCity) }}
            部電影
          </p>
          <p>特殊廳：{{ versions }}</p>
        </div>
        <button class="secondary"
                :class="{active: !activeCity}"
                @click="data.onClickCity('')">全部縣市
        </button>
        <ul class="theaters">
          <li v-for="theater in theaters" class="theater">
            <p>{{ theater.name }}</p>
            <img src="@/assets/chevron-right.svg" :alt="`${theater.name}所播放的電影`"/>
          </li>
        </ul>
      </aside>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "@/style" as *;
@use "@/styles/button";

main {
  margin: 40px auto 80px; /* auto: 水平置中，上 左右 下 */

  h1 {
    font-weight: 700;
    font-size: clamp(28px, 4vw, 40px); /* 字體大小4%視窗寬度，限制[28px,40px]之間 */
    letter-spacing: 1px;
    line-height: 1.15;
  }
}

.layout {
  display: grid;
  /* 左台灣地圖最大 560px 可壓縮至 0(px) */
  /* 右邊佔滿剩餘空間 */
  grid-template-columns: minmax(0, 560px) minmax(0, 1fr);
}

svg.taiwan-map {
  /* stroke-linejoin: round → 轉角圓滑，描邊比較順 */
  path.city, text.city-label {
    stroke-linejoin: round;
  }

  path.city {
    fill: #e2e2e2;
    stroke: #ffffff;
    stroke-width: 1.5;

    cursor: pointer;
  }

  text.city-label {
    /* region 文字水平+垂直置中 */
    text-anchor: middle; /* 文字水平置中於 centroid（預設是從左端開始） */
    dominant-baseline: central; /* 文字垂直置中於 centroid（預設是以基線對齊） */
    /* endregion */

    /* region 白色描框 */
    /*
    stroke 外框顏色
    stroke-width 外框粗細
    paint-order: stroke → 先畫描邊再畫填色，白邊在字的外側，不會把字體吃細
    */
    stroke: #ffffff;
    stroke-width: 3px;
    paint-order: stroke;
    stroke-linejoin: round;
    /* endregion */

    /* 顯示順序<text>在上<path>在下，現在hover事件綁定在<path>上，會被上面的<text>擋住不觸發，所以設定 */
    pointer-events: none;
  }

  /* region 動畫 */
  path.city, text.city-label {
    /* region 當 hover 使用 transform scale 時，以該 path 的中心放大 */
    /* transform-box: fill-box; 將變形參考範圍設定為元素自身的外框，而不是 SVG 預設的 view-box */
    /* 將變形原點設定為元素自己外框的中心 */
    transform-box: fill-box;
    transform-origin: center;
    transition: 0.3s var(--ease);
    /* endregion */
  }

  path.city {
    &:hover {
      transform: scale(1.1);
      /* z-index: 999; SVG 元素沒效果 */
    }

    &.active {
      transform: scale(1.15);
    }
  }

  text.city-label {
    &.active {
      transform: scale(1.1);
    }
  }

  /* endregion */
}

aside {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .detail {
    min-height: 140px;
    padding: 16px;
    border-bottom: 1px solid var(--line);

    h2 {
      font-size: 22px;
      font-weight: 700;
    }

    p {
      color: var(--text-dim);
    }
  }

  button.secondary {
    @include button.secondary;
    height: 34px;
    width: fit-content;
    padding: 0 14px;
    border-radius: var(--pill);

    &.active {
      @include button.primary;
    }
  }

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
}


/* region RWD */
main {
  width: min(1320px, calc(100% - 200px));

  @media (max-width: 1000px) {
    width: min(900px, calc(100% - 96px));
  }

  @media (max-width: 470px) {
    width: calc(100% - 170px);
  }
}

/* endregion */
</style>

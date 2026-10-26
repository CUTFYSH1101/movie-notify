<script setup lang="ts">
// @ts-expect-error 找不到 JSON 模組的型別宣告，忽略這行錯誤
import taiwan from '@assets/taiwan-map.json'
import { computed, onMounted, ref } from 'vue'
import data from '@/js/state/cityPageDatasLifecycle.ts'
import { cityDatas, activeCity, allTheaters } from '@/js/state/cityPageDatasLifecycle.ts'
import type { CityDataKey } from '@/js/api/cityDatas.ts'
import TheatersList from '@/components/TheatersList.vue';

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

// :class="{ active: boolean }"
function getTabClass(value: CityDataKey): {} {
  return { active: activeColorLerp.value === value }
}

// endregion

onMounted(data.start)
</script>

<template>
  <main>
    <header>
      <h1>影城地圖</h1>
    </header>
    <div class="layout">
      <div class="map-box">
        <div class="segmented-control">
          <button @click="setColorLerp('theaterIds')" :class="getTabClass('theaterIds')">影城數</button>
          <button @click="setColorLerp('movieCount')" :class="getTabClass('movieCount')">上映電影</button>
          <button @click="setColorLerp('versions')" :class="getTabClass('versions')">廳型豐富度</button>
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
        <TheatersList v-if="theaters" :theaters="theaters"/>
        <section v-else v-for="city in cityDatas" class="city-theaters-part">
          <h2>{{ city.name }}</h2>
          <TheatersList :theaters="allTheaters[city.name]"/>
        </section>
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
    margin-bottom: 24px;
    font-weight: 700;
    font-size: clamp(28px, 4vw, 40px); /* 字體大小4%視窗寬度，限制[28px,40px]之間 */
    letter-spacing: 1px;
    line-height: 1.15;
  }
}

.layout {
  display: grid;
  /* 左台灣地圖最大 400px 可壓縮至 0(px) */
  /* 右邊佔滿剩餘空間 */
  grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
}

.segmented-control {
  /* 排版 */
  gap: var(--gap-sm);
  @include flex-align-center;

  /* 大小 */
  width: fit-content;
  padding: 4px;

  /* 形狀顏色 */
  background: var(--fill-strong);
  border-radius: var(--pill);

  button {
    height: 38px;
    padding: 0 18px; /* 上下 左右 */
    border-radius: var(--pill);
  }

  button.active {
    background: var(--surface-solid);
    color: var(--text);
    font-weight: 500;
    box-shadow: 0 1px 3px var(--shadow);
  }
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
      filter: brightness(1.05) saturate(1.2);
      stroke: #fff;
      stroke-width: 2.4;
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

  .city-theaters-part {
    h2 {
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-dim);
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

@media (max-width: 700px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* endregion */
</style>

# movie-notify

## 全關

taskkill /IM node.exe /F

## 建立專案

### 創建vite

`npm create vite@latest`

### 運行

`npm run dev`

### 使用 ai design skills

npx skills add Leonxlnx/taste-skill
grill-with-docs

---

## sqlite

1. 錯誤來源：
    ```typescript
    import { createServer } from 'node:http'
    import { DatabaseSync } from 'node:sqlite'
    import { fileURLToPath } from 'node:url'
    ```

   錯誤訊息：
    ```text
    Vue: Cannot find name `node:http`. Do you need to install type definitions for node? Try `npm i --save-dev @types/node` and then add `node` to the types field in your tsconfig.
    ```

   解法、在`tsconfig.node.json`改成：
    ```json
    {
      "include": ["vite.config.ts", "server/**/*.ts"]
    }
    ```

2. 代理（proxy）轉到 localhost:3000，在`vite.config.ts`新增：
    ```typescript
    export default defineConfig({
        server: {
            proxy: {
                '/api': 'http://localhost:3000',
            },
        },
    })
    ```

3. 使用`npm run server`開啟 Node.js 伺服器，在`package.json`新增：
   ```json
   {
     "scripts": {
       "server": "node server/index.ts"
     }
   }
   ```
4. 完成後重開 IDE 並測試：
   ```shell
   npm run server
   ```
   輸入網址`http://localhost:3000/api/movies`
5. 如果有佔著3000埠的程序，強制關閉：`npx kill-port 3000`

---

## typescript 使用 @ 當根目錄

例如：`import { ... } from '@/js/movies'`

- `tsconfig.app.json`
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": [
           "./src/*"
         ]
       }
     }
   }
   ```
- `vite.config.ts`
   ```typescript
   export default defineConfig({
     resolve: {
       alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url)),
       }
     }
   })
   ```

## vue3

- setup 元件初始化，不適合操作DOM
- beforeCreate Vue 2 舊寫法，現在通常不需要
- created 元件建立完成，不適合操作DOM
- beforeMount 即將第一次渲染，不適合操作DOM
- mount DOM已經建立並放進頁面

### 沒圖片使用 @error 判斷

- 每個電影卡需要一個`@error="posterFailed = true"`所以需要建一個新的.vue檔
- src="圖片.png" @error 會判斷 src 的圖片存不存在
- 當 @error 時將 <img> 藏起來，這邊是顯示電影片名

## scss

- 會用他是因為可以重用方法，scss可以無痛相容css語法，所以不用sass
- npm i -D sass-embedded

### 字型

`index.html`

```html
<!-- Noto Sans TC 只載入實際用到的三個字重：400 內文、500 介面強調、700 標題 -->
<!-- 只抓 400、500、700 三個字重，並加了 display=swap -->
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet"/>
```

```css
:root {
  --sans: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif;
  font: 15px/1.5 var(--sans); /* 大小/字高 字型 */
}
```

### header固定上緣用 `position: sticky` 而不是 `fixed`

- 用 sticky 可以不用給 <main> 上方留空白
- TopBar 的祖先（這裡是 #app、body）不能設 overflow: hidden、auto 或 scroll，否則黏住的對象會變成那個容器

### grid gap

```sass
// 海報
ul.movies-grid
  grid-template-columns: repeat(5, minmax(0, 1fr))
  gap: var(--gap-xl) var(--gap-lg)
  /* 底下的元素由gap決定間距 */
  margin: 0

.movie-cell
  gap: 12px

.info-cell
  gap: 6px
```

### rwd

原本用auto+左右固定值margin，但是超大螢幕下會跑版

```sass
main
  width: min(1320px, calc(100% - 100px))
  margin: 0 auto

  @media (max-width: 1000px)
    width: min(1320px, calc(100% - 48px))

header
  width: min(1320px, calc(100% - 24px))
  margin: 0 auto
  box-sizing: border-box
  /*  width: auto
    margin: 0 12px */
  padding: 12px 24px
```

#### grid media 用 width 取代固定值或百分比 margin，避免跑版

```sass
// 中間主視窗寬度自己算
main
  width: min(1320px, calc(100% - 100px))
  margin: 0 auto

  @media (max-width: 1000px)
    width: min(1320px, calc(100% - 48px))

ul.movies-grid
  @media (max-width: 1000px)
    grid-template-columns: repeat(4, minmax(0, 1fr))
  @media (max-width: 900px)
    grid-template-columns: repeat(3, minmax(0, 1fr))
  @media (max-width: 600px)
    grid-template-columns: repeat(2, minmax(0, 1fr))
  @media (max-width: 470px)
    grid-template-columns: repeat(1, minmax(0, 1fr))
```

## select, datalist

npm i @nuxt/ui tailwindcss

```typescript
// vite.config.ts
import ui from '@nuxt/ui/vite'

export default defineConfig({ plugins: [vue(), ui()] })
```

```typescript
// main.ts
import ui from '@nuxt/ui/vue-plugin'

createApp(App).use(ui).mount('#app')
```

要放在 css 不要放在 scss 檔案
並且 main.ts 要 import './assets/main.css' 確認路徑正確
此例用 `./forImport.css`

```css
/* assets/main.css */
@import "tailwindcss";
@import "@nuxt/ui";
```

另外還要兩個小設定：

- index.html 的 <div id="app"> 加上 class="isolate"
- App.vue 最外層包一個 <UApp>

tsconfig.app.json

```json
{
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "shared/**/*.ts",
    "auto-imports.d.ts",
    "components.d.ts"
  ]
}
```

這樣程式才認得<UApp>、<UButton>、<UInputMenu/>、<USelect/>
記得重跑

```text
npm run server
npm run dev
```

或是把 `components.d.ts` 打開看一下，有時候這樣就會觸發重新索引
或是File → Invalidate Caches… → Restart
不然IDE可能還是無法辨識

```text
Unknown html tag UInputMenu
```

`components.d.ts` 是 `dev server` 跑起來時才自動產生或更新的，Vite 掃描到它，把它寫進 components.d.ts

錯誤訊息

```text
Uncaught SyntaxError: The requested module '/@id/__vite-optional-peer-dep:vue-router:@nuxt/ui' does not provide an export named 'useRoute' (at vue-router.js:2:10)
```

安裝vue-router
npm install vue-router

open-on-focus
當選中該datalist自動展開選單

sideOffset: 0
彈出視窗跟觸發它的元素之間，要留多少距離，設零表示貼一起

inert
可以讓指定的元素及其所有後代子元素變得無法互動

tailwind 在 CSS 用 @utility 定義成自訂 class

```markdown
blur(40px) 背景模糊（明暗對比會變低）
saturate(1.8) 背景飽和度增加，1.8 是比原本鮮豔 80%
backdrop-filter: blur(40px) saturate(1.8);
backdrop-blur-xl 24px（.glass 用的）
backdrop-blur-2xl 40px（.glass-panel 用的）
```

- 寫在 forImport.css：
   ```css
   @utility glass {
      @apply bg-white/60 backdrop-blur-xl ring-1 ring-white/75;
   }
   @utility glass-panel {
      @apply rounded-3xl p-2 bg-white/55 backdrop-blur-2xl backdrop-saturate-[1.8]
      ring-1 ring-white/70 shadow-[0_20px_50px_rgba(0,0,0,.18)];
   }
   ```
- 用法：
   ```html
   <div class="glass rounded-full h-12">...</div>
   ```

### <USelect>打開後整個頁面寬度會改變

- 永遠保留捲軸空間（全站一致）
    ```css
    html {
      scrollbar-gutter: stable;
    }
    ```
  同時要在 App.vue 關掉 Reka 自己補的 padding，不然會補兩次，內容反而往左縮：
    ```html
    <UApp :scroll-body="false"></UApp>
    ```
- 鎖捲動
    - USelect（Reka SelectContent）：bodyLock 預設是 true，所以打開會鎖捲動、捲軸消失
    - UInputMenu（Reka ComboboxContent）：bodyLock 預設是 未設定（等於 false），所以不會鎖
      ```html
      :content="{hideWhenEmpty: true, sideOffset: 0, bodyLock: true}"
      ```

## 台灣地圖

npm install -D d3-geo topojson-client taiwan-atlas @types/d3-geo @types/topojson-client
d3 geo 是基於 d3 js 但是專門處理地理資料
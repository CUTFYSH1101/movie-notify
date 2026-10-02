# movie-notify

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

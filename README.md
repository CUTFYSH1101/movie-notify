### 創建vite

`npm create vite@latest`

### 運行

`npm run dev`

### 專案名稱

movie-notify

### 使用 ai design skills

npx skills add Leonxlnx/taste-skill
grill-with-docs

---

### sqlite

1. 錯誤來源：
    ```typescript
    import { createServer } from 'node:http'
    import { DatabaseSync } from 'node:sqlite'
    import { fileURLToPath } from 'node:url'
    ```

   錯誤訊息：
    ```markdown
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

### typescript 使用 @ 當根目錄

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
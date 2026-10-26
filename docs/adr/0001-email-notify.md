---
status: accepted
---

# 0001 追蹤影片的「上映前 Email 提醒」採後端定時推播

## Context

GitHub Pages 是純靜態託管,無法執行 cron,也無法安全持有 SMTP 憑證。
專案已有一個 Python 後端(PythonAnywhere),其 sqlite 已含電影資料與 `release_date`,
且 PythonAnywhere 免費方案提供排程任務與 SMTP。需求是「最小規模、無會員、且人不在網站時也能收到通知」。

## Decision

1. **架構:後端定時推播。** 前端只負責「建立/取消追蹤 + 填 Email」並呼叫後端 API;
   檢查上映日與寄信全部在後端的每日排程任務執行。
2. **身分:無密碼。** 前端以 `crypto.randomUUID()` 產生 subscriber id 存 localStorage,
   後端以 id + email 當 key 儲存追蹤清單。接受「換瀏覽器/清快取會失去本機關聯」的取捨;
   email 本身作為長期識別,退訂連結用於停止。
3. **觸發條件:以 `release_date` 為準,上映前 N 天**(預設 3,後端可調)寄出提醒。
   實作時發現資料庫目前 105 部電影的 `release_date` 全為 `NULL`(爬蟲尚未抓這欄),
   因此參考上映日改為 `COALESCE(release_date, 該片最早場次日期)`:有 `release_date` 時照用,
   沒有就退回 `showings` 的最早日期。待爬蟲補上 `release_date` 後會自動改用它,無需改碼。
4. **寄信規則:每片每訂閱者只通知一次**(後端記 `notified_at`),信件底部附帶隨機 token 的**退訂連結**。
5. **寄信管道:PythonAnywhere 排程 + SMTP(Gmail 應用程式密碼)**;帳密放後端環境變數,
   不進前端、不進 git。

## Considered Options

- **純靜態 + 開網頁才用 EmailJS 寄信**:人不在網站就收不到,且公開金鑰易被濫用 → 否決(不符「可靠通知」)。
- **引入 n8n**:多一個要維運的服務,既有後端已能做 cron → 不需要。
- **追蹤清單只存 localStorage / cookie**:後端排程讀不到、且會被清 → 無法定時推播 → 否決。

## Consequences

- 後端需新增(本 ADR 只記決策,程式碼之後處理):subscriptions / tracks 資料表、
  追蹤 CRUD API、退訂端點、每日排程腳本、SMTP 設定。
- 前端需新增:追蹤按鈕與狀態、Email 輸入、呼叫 API(目前尚無追蹤功能)。
- 「無密碼」代表任何人知道某 email 即可替它訂閱;以退訂連結緩解,
  日後可加「首次確認信(double opt-in)」進一步防濫用(最小版先略)。
- 免費 SMTP(如 Gmail ~500 封/日)有寄信量上限,小規模足夠。

## 後端規格(日後貼到 PythonAnywhere;非本次實作)

- 資料表
  - `subscriptions(id TEXT PK, email TEXT, unsubscribe_token TEXT, created_at)`
  - `tracks(subscriber_id TEXT, movie_id TEXT, notified_at TEXT NULL, PRIMARY KEY(subscriber_id, movie_id))`
- API
  - `POST /api/track` body: `{ subscriber_id, email, movie_id }` → upsert subscription + track
  - `DELETE /api/track` body: `{ subscriber_id, movie_id }`
  - `GET  /api/unsubscribe?token=...` → 停用該 subscription 的所有 track
- 每日排程(scheduled task)
  - 掃 `movies` 中 `release_date` 落在 `[today, today + N]` 的片
  - join `tracks`(`notified_at IS NULL`)取得收件者
  - 逐封用 SMTP 寄出(含退訂連結)→ 成功後寫 `notified_at`

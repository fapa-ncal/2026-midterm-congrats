# FAPA 北加州分會・恭賀信工具

輸入 zip code，查出你選區 2026 年 11 月新當選的國會議員（CA-9 至 CA-21）、州參議員、州眾議員和市長，並使用恭喜信範本寄出祝福。

資料來源：加州參議院人口統計辦公室 zip code 對照表（國會為 Prop 50 新選區）；選舉結果來自加州州務卿、美聯社、KQED、Decision Desk HQ。

網站預設為英文 `/`，繁體中文入口為 `/zh-tw/`。網址決定語言；中英按鈕即時切換內容與網址，保留目前查詢和會員選擇，不再由 localStorage 蓋過連結指定的語言。

分享預覽與網站圖示放在 `assets/`：`og-image-en.jpg`（英文）與 `og-image.jpg`（繁體中文）皆為 1200 × 630；`favicon.ico` 包含 16、32、48 px 圖示，另提供 32、512 px PNG 與 180 px Apple touch icon。圖示由 FAPA logo 簡化而成，保留紅色字樣、台灣輪廓與藍框。原始設計圖與 imagegen 提示詞保存在 `output/imagegen/`。

兩個入口都有靜態 Open Graph、Twitter、canonical 和 hreflang 標記，分享平台不需要執行 JavaScript。英文使用 `en_US`，繁體中文使用 `zh_TW`。若更換網域或專案路徑，更新 `index.html` 的 alternate 連結後重新產生頁面。

## 檔案結構

- `index.html`：英文入口及共用 HTML 來源
- `zh-tw/index.html`：產生的繁體中文入口，不直接編輯
- `app.js`、`styles.css`：兩個入口共用的程式、翻譯與樣式（沒有 framework 或 module，本機 `file://` 與 GitHub Pages 都能運作）
- `page-meta.js`：兩種語言共用的分享資訊設定，供產生腳本與即時語言切換使用
- `scripts/generate-pages.js`：同步兩種語言的靜態入口（Node，無外部套件）
- `zip.js`：zip code 對照表（全域 `const ZIP`），每個 zip 一行
- `data.js`：當選人資料（全域 `const CD`、`SD`、`AD`、`MAYOR`）
- `scripts/validate.js`：資料檢查工具（Node，不需安裝任何套件）

兩個入口會先載入 `zip.js`、`data.js`、`page-meta.js`，再執行 `app.js`。修改 `index.html` 或 `page-meta.js` 後，執行 `node scripts/generate-pages.js`，並一併提交產生的頁面。更新共用 JS、CSS 或選舉資料不需要重新產生頁面；GitHub Pages 直接發布已提交的靜態檔案。

## 如何更新選舉結果

直接編輯 `data.js`：

- `CD`（國會議員）、`SD`（州參議員）、`AD`（州眾議員）以選區號碼為 key，`MAYOR` 以城市名稱為 key（城市名稱必須和 `zip.js` 中的城市名稱一致）
- 常用欄位：`n` 姓名、`p` 黨籍、`re` 連任、`isNew` 新當選、`pend` 尚未確定、`vs` 對手、`email`、`url`、`note`
- 市長的 `st` 為 `called`（已確定）、`leading`（領先）或 `close`（膠著）
- 州參議員只有偶數選區在 2026 年改選，不要加入奇數選區

改完後請執行 `node scripts/validate.js` 確認資料沒有問題。

## ZIP 資料來源

`zip.js` 的資料來自加州參議院人口統計辦公室（California Senate Office of Demographics）的 zip code 對照表。注意：用來產生 `zip.js` 的腳本**不在**這個 repo 裡，目前請直接編輯 `zip.js`。

格式如下：

```js
const ZIP = {
  "94607":["Oakland",[[12,100]],[[7,100]],[[18,100]]],
  ...
};
// zip -> [城市, 國會選區[[選區, 百分比]], 州參議院選區[[選區, 百分比]], 州眾議院選區[[選區, 百分比]]]
```

一個 zip 可能跨越多個選區，百分比代表該 zip 落在各選區的比例（每一層加總約 100）。已移除國會、州參議院、州眾議院百分比全部為 0 的 zip。

## 檢查資料

```
node scripts/validate.js
node scripts/generate-pages.js --check
```

會檢查：每層百分比加總約 100；涵蓋範圍內被引用的選區都有資料（刻意不涵蓋的選區列在腳本的 `INTENTIONALLY_OUT`，範圍設定在 `COVERED`）；市長城市都對得到 zip.js 的城市；SD 沒有奇數選區。有問題時會列出訊息並以非 0 狀態結束。

# Pixel Trivia 像素風闖關問答遊戲

## 專案簡介
這是一個使用 React + Vite 打造的像素風格（Pixel Art）闖關問答遊戲。
關卡中的「關主」圖片是使用 DiceBear API 動態產生的像素頭像。
遊戲題目來自 Google Sheets，並會將玩家的答題成績記錄回 Google Sheets 中。

## 環境需求
- Node.js (建議 v18 以上)
- npm 或 yarn

## 安裝與執行

1. 安裝依賴套件：
   ```bash
   npm install
   ```

2. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

## Google Sheets 與 Apps Script 設定教學

### 1. 準備 Google Sheets
1. 建立一個新的 Google 試算表。
2. 建立兩個工作表（請確保名稱完全一致）：
   - 第一個命名為 **`題目`**
   - 第二個命名為 **`回答`**
3. 在 **`題目`** 工作表的第一列輸入以下標題：
   - A1: `題號`
   - B1: `題目`
   - C1: `A`
   - D1: `B`
   - E1: `C`
   - F1: `D`
   - G1: `解答` (請填寫正確選項的英文字母，如 A、B、C 或 D)
4. 在 **`回答`** 工作表的第一列輸入以下標題：
   - A1: `ID`
   - B1: `闖關次數`
   - C1: `總分`
   - D1: `最高分`
   - E1: `第一次通關分數`
   - F1: `花了幾次通關`
   - G1: `最近遊玩時間`

### 2. 設定 Google Apps Script (GAS)
1. 在剛剛的 Google 試算表中，點擊上方選單的 **「擴充功能」** -> **「Apps Script」**。
2. 將編輯器內原本的程式碼清空。
3. 把本專案內 `Code.gs` 的所有內容複製並貼上到 Apps Script 編輯器中。
4. 點擊上方的「儲存」圖示（或按 `Ctrl + S`）。
5. 點擊右上角的 **「部署」** -> **「新增部署作業」**。
6. 點擊「選取類型」旁邊的齒輪圖示，選擇 **「網頁應用程式」**。
7. 設定如下：
   - 說明：(如：Pixel Trivia API)
   - 執行身分：**「我」**
   - 誰可以存取：**「所有人」** (⚠️非常重要，否則前端無法請求資料)
8. 點擊 **「部署」**。如果是第一次部署，Google 會要求授權：
   - 點擊「授權存取」 -> 選擇你的帳號 -> 點擊「進階」 -> 「前往 不安全的頁面」 -> 「允許」。
9. 部署完成後，請複製畫面上顯示的 **「網頁應用程式網址」**。

### 3. 設定前端環境變數
1. 回到本專案，開啟根目錄下的 `.env` 檔案。
2. 將剛才複製的網址填入 `VITE_GOOGLE_APP_SCRIPT_URL` 中：
   ```env
   VITE_GOOGLE_APP_SCRIPT_URL="在此貼上你的_GAS_網址"
   VITE_PASS_THRESHOLD=3
   VITE_QUESTION_COUNT=5
   ```
3. 確保存檔後，終端機執行指令即可開始遊玩：
   ```bash
   npm run dev
   ```

---

## 🚀 部署至 GitHub Pages

這份專案已經設定好 **GitHub Actions** (`.github/workflows/deploy.yml`)，只要推上 GitHub 就能自動建置並部署到 GitHub Pages！

### 部署步驟

1. **建立 GitHub 儲存庫並推上程式碼**
   - 在 GitHub 新增一個 Repository
   - 將本專案的所有檔案 Push 到該 Repository 的 `main` 分支上

2. **設定儲存庫的 GitHub Secrets（設定 GAS API 網址）**
   為了不讓前端 API 網址直接外流，我們透過 GitHub Actions 來把密碼注入。
   - 前往你 GitHub Repository 的 **Settings** 分頁
   - 點開左側導覽列的 **Secrets and variables** -> **Actions**
   - 在 **"Repository secrets"** 點擊 `New repository secret`
   - **Name**: 輸入 `VITE_GOOGLE_APP_SCRIPT_URL`
   - **Secret**: 貼上你之前拿到的 GAS 網頁應用程式網址 (例如 `https://script.google.com/macros/.../exec`)
   - *(設定完畢後再 Push 一次，或是去 Actions 手動執行 Deploy)*

3. **(選填) 設定過關門檻等自訂變數**
   - 若要調整 `VITE_PASS_THRESHOLD` (通關門檻) 或 `VITE_QUESTION_COUNT` (題目數)
   - 在相同的設定頁面，切換到 **"Variables"** 頁籤
   - 點選 `New repository variable`，填入名稱跟預期的數值即可（未設定則吃預設值：3 與 5）

4. **開啟 GitHub Pages 權限設定**
   - 在 Repository 的 **Settings** 分頁，點開左側 **Pages**
   - 找到 **Build and deployment** 下方的 **Source**
   - 請從 `Deploy from a branch` **改成 `GitHub Actions`**
   - （完成上述步驟後，過幾分鐘你的專案就會自行動態部署並產生網址了！）

---

## 題庫匯入測試（生成式 AI 基礎知識）
你可以直接複製以下表格的內容，並在 Google Sheets 的 **`題目`** 工作表從 `A2` (第二列第一欄) 開始貼上進行測試！

| 題號 | 題目 | A | B | C | D | 解答 |
|---|---|---|---|---|---|---|
| 1 | 生成式 AI（Generative AI）的主要功能是什麼？ | 只能用來分類垃圾郵件 | 根據學習到的模式生成新的文字、圖像或音訊 | 只能用來搜尋網頁 | 單純紀錄資料庫的資料 | B |
| 2 | 下列何者是知名的生成式 AI 語言模型？ | ChatGPT (GPT-4) | Excel | Photoshop | Windows 11 | A |
| 3 | 所謂的「Prompting（提示工程）」意思為何？ | 破解 AI 的密碼 | 編寫程式碼來訓練 AI | 設計用來引導 AI 產生特定回答的輸入指令 | 讓電腦加速的硬體技術 | C |
| 4 | LLM 的全名是什麼？ | Large Learning Machine | Low Level Model | Large Language Model | Long Lasting Memory | C |
| 5 | Midjourney 或 DALL-E 這類模型主要用來生成什麼？ | 程式碼 | 報表數據 | 音樂 | 圖像 | D |
| 6 | 在使用生成式 AI 時，若 AI 產生了看似合理但實際上錯誤或虛構的資訊，這種現象稱為什麼？ | 幻覺 (Hallucination) | 突破 (Breakthrough) | 覺醒 (Awakening) | 降級 (Degradation) | A |
| 7 | 下列哪一種做法「最不適合」直接依賴生成式 AI？ | 寫一首祝賀朋友的藏頭詩 | 總結一篇長篇文章的重點 | 提供完全正確無誤的醫療診斷處方 | 產生一份簡報的文字大綱 | C |
| 8 | 訓練大型語言模型通常需要消化大量的什麼？ | 圖片 | 結構與非結構化的文本數據 | 影片 | 音訊檔案 | B |
| 9 | 什麼是 Token 在自然語言處理中的概念？ | 登入 AI 系統的密碼 | 文本被拆分後的基本單位（例如一個詞或一個字元） | 一種加密貨幣 | AI 模型的版本號 | B |
| 10 | AI 回答「這我不知道」代表什麼意思？ | 電腦壞掉了 | 模型的守門員機制介入，或是訓練資料中沒有相關知識 | AI 在對人類開玩笑 | AI 正在睡覺 | B |

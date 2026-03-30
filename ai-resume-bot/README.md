# AI Resume Bot — 完整部署教學

## 專案結構

```
ai-resume-bot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      ← 後端：串接 Notion + Gemini（不暴露 key）
│   ├── globals.css            ← 全域樣式 + Tailwind
│   ├── layout.tsx             ← HTML shell + metadata
│   └── page.tsx              ← 主頁面（歡迎畫面 + 聊天）
├── components/
│   ├── ChatBubble.tsx         ← 對話氣泡
│   ├── PromptCard.tsx         ← 提示詞卡片
│   └── TypingIndicator.tsx    ← 打字中動畫
├── lib/
│   └── notion.ts              ← Notion API 資料抓取與轉換
├── .env.example               ← 環境變數範本
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 步驟 1 — 安裝套件

```bash
# 進入專案目錄
cd ai-resume-bot

# 安裝所有相依套件
npm install

# 驗證可以在本機跑起來
npm run dev
# 開啟 http://localhost:3000
```

---

## 步驟 2 — 準備 Notion Database

1. 在 Notion 建立一個 Database（inline 或 full page 都可以）
2. 建議 properties 設計：
   - `Name` (title) — 項目名稱（例如：工作經歷、學歷、專案）
   - `Type` (select) — 類型（Work / Education / Project / Skill）
   - `Company` (text) — 公司或學校
   - `Period` (date) — 時間區間
   - `Description` (text) — 說明
   - 每個 page 的 body 可以放更詳細的描述

3. 建立 Notion Integration：
   - 前往 https://www.notion.so/my-integrations
   - 點「New Integration」
   - 名稱隨意，選你的 workspace
   - 取得 `Internal Integration Token`（開頭是 `secret_`）

4. 連接 Integration 到你的 Database：
   - 開啟你的 Notion Database 頁面
   - 右上角「···」→「Connect to」→ 選你剛建的 Integration

5. 取得 Database ID：
   - Database 頁面 URL：`https://notion.so/yourname/XXXXXXXX?v=...`
   - `XXXXXXXX` 那段（32 字元）就是 Database ID

---

## 步驟 3 — 環境變數

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```
GEMINI_API_KEY=你的_Gemini_Key
NOTION_API_KEY=secret_你的_Notion_Token
NOTION_DATABASE_ID=你的_32字元_Database_ID
```

---

## 步驟 4 — 推送到 GitHub

```bash
# 初始化 Git（如果還沒有）
git init
git add .
git commit -m "init: AI resume bot"

# 在 GitHub 建立新 repo（https://github.com/new）
# 然後：
git remote add origin https://github.com/你的帳號/ai-resume-bot.git
git branch -M main
git push -u origin main
```

---

## 步驟 5 — 部署到 Vercel

1. 前往 https://vercel.com → 用 GitHub 帳號登入
2. 點「Add New Project」→ 選 `ai-resume-bot` repository
3. Framework 選 **Next.js**（通常自動偵測）
4. 展開「Environment Variables」，新增三個變數：

| 變數名稱 | 值 |
|---|---|
| `GEMINI_API_KEY` | 你的 Gemini API Key |
| `NOTION_API_KEY` | secret_... |
| `NOTION_DATABASE_ID` | 32 字元 ID |

5. 點「Deploy」，等待約 1 分鐘
6. 部署完成後，Vercel 給你一個網址，例如 `https://ai-resume-bot.vercel.app`

---

## 更新流程

之後你修改程式碼，只要：

```bash
git add .
git commit -m "feat: 更新 UI"
git push
```

Vercel 會自動重新部署，不需要手動操作。

---

## 自訂內容

| 要改什麼 | 在哪裡改 |
|---|---|
| 名字 (`May Chen`) | `app/page.tsx` 第 1 行標題 |
| 提示詞卡片 | `app/page.tsx` → `PROMPT_SETS` 陣列 |
| AI 口吻和限制 | `app/api/chat/route.ts` → `buildSystemPrompt()` |
| 顏色 | `app/globals.css` + `tailwind.config.ts` |
| Notion 欄位對應 | `lib/notion.ts` → `propertiesToText()` |

---

## 安全性說明

- 所有 API Key 只存在 Vercel 環境變數，**前端完全看不到**
- 後端 API 有 Rate Limiting（每 IP 每分鐘 20 次）
- Notion 資料有 5 分鐘快取，減少 API 消耗
- 使用者訊息上限 1000 字元
- AI 被嚴格限制只能根據你的資料回答

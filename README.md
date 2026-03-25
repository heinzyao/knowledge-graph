# Easy Knowledge Graph

**繁體中文** | [English](#english)

以 Excel 檔案為資料來源的互動式知識圖譜，靈感來自 [Obsidian Graph View](https://obsidian.md/)。透過瀏覽器即可視覺化探索本地 `.xlsx` 檔案之間的關聯網路。

An interactive knowledge graph powered by Excel files, inspired by [Obsidian Graph View](https://obsidian.md/). Visualize and explore relationships between your local `.xlsx` files directly in the browser.

![Python](https://img.shields.io/badge/Python-3.11+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green) ![D3.js](https://img.shields.io/badge/D3.js-v7-orange) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 功能特色

- **互動式力導向圖** — D3.js 力模擬，支援拖曳、縮放、平移
- **Excel 原生支援** — 直接讀取 `.xlsx`，無需安裝 Office
- **Meta Sheet 規範** — 每個檔案可加一張 `Meta` 工作表定義標題、標籤、連結、說明
- **顯式 + 隱式連結** — Meta 明確指定的連結（顯式），以及儲存格內容比對到其他文件名稱的自動偵測連結（隱式）
- **即時同步** — watchdog 監聽資料夾，變更時透過 WebSocket 自動更新圖譜
- **內容預覽面板** — 點擊節點展開側面板，逐頁籤瀏覽工作表資料（預設顯示前 100 列）
- **標籤篩選 & 搜尋** — 依標籤或文字過濾節點，反白相關連結
- **局部視圖** — 雙擊節點僅顯示該節點及其直接鄰居
- **匯出獨立 HTML** — 一鍵產生內嵌所有資料的單一 HTML 檔，無需 Python 即可分享瀏覽
- **深色介面** — 預設深色主題，易於長時間閱讀

---

## 系統需求

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) 套件管理工具

---

## 快速開始

### 1. 安裝依賴

```bash
git clone https://github.com/heinzyao/easy-knowledge-graph.git
cd easy-knowledge-graph
uv sync
```

### 2. 建立範例資料（可選）

```bash
uv run python create_sample.py
```

會在 `sample_data/` 目錄下產生 9 個範例 Excel 檔，以 **Apple iPhone 供應鏈**為主題，每個檔案代表一家真實供應商：

| 層級 | 企業 | 供應項目 |
|------|------|----------|
| Tier 1 | 台積電 | A 系列晶片代工（3nm/5nm）|
| Tier 1 | 三星電子 | LPDDR5 記憶體、NAND Flash |
| Tier 1 | 索尼半導體 | CMOS 影像感測器 |
| Tier 1 | 康寧 | Ceramic Shield 螢幕玻璃 |
| Tier 1 | 村田製作所 | MLCC 電容、RF 射頻模組 |
| Tier 0 組裝 | 富士康 | iPhone 最終組裝（70%）|
| 品牌 | Apple | 設計、品牌、供應鏈管理 |
| 物流 | UPS物流 | 全球空運配送 |
| 零售（無 Meta）| Best Buy | 終端零售（隱式連結示範）|

### 3. 啟動伺服器

```bash
# 使用預設 sample_data/ 資料夾
uv run python main.py

# 指定自訂資料夾
uv run python main.py /path/to/your/excel/folder

# 指定 port（預設 8000，port 被占用時使用）
uv run python main.py --port 8001

# 同時指定資料夾與 port
uv run python main.py /path/to/your/excel/folder --port 8001
```

啟動後瀏覽器會自動開啟對應的本地網址。

---

## Excel 檔案格式

### Meta 工作表（選填）

在 `.xlsx` 檔案中新增一張名為 `Meta` 的工作表，第一欄為鍵、第二欄為值：

| 鍵 | 值（範例）| 說明 |
|----|-----------|------|
| title | 技術規格文件 | 節點顯示名稱（預設為檔名）|
| tags | 技術, 後端, API | 逗號分隔的標籤 |
| links | 專案計畫書, 資料庫設計 | 逗號分隔的連結目標（檔名或標題）|
| description | 系統技術架構與 API 規格說明 | 節點說明文字 |

### 隱式連結

若工作表中的儲存格內容完全符合另一個檔案的標題或檔名，系統會自動建立隱式連結（預設隱藏，可透過工具列開關顯示）。

---

## 操作說明

| 操作 | 功能 |
|------|------|
| 點擊節點 | 開啟右側內容預覽面板 |
| 雙擊節點 | 進入局部視圖（僅顯示鄰居）|
| 雙擊空白處 | 退出局部視圖 |
| 滾輪 / 觸控板 | 縮放圖譜 |
| 拖曳背景 | 平移圖譜 |
| 拖曳節點 | 固定節點位置 |
| 搜尋框 | 即時過濾節點（標題比對）|
| 標籤下拉選單 | 依標籤篩選節點 |
| 顯示隱式連結 | 切換顯示/隱藏自動偵測的隱式連結 |
| 重新整理按鈕 | 手動觸發全圖重建 |
| 📥 匯出按鈕 | 匯出為可離線分享的獨立 HTML 檔 |

### 匯出獨立 HTML

點擊工具列的「📥 匯出」按鈕，瀏覽器會下載一個 `knowledge-graph.html` 檔案。此檔案：

- 內嵌所有節點資料、圖結構與工作表內容
- 內嵌 D3.js（匯出時自動下載，或保留 CDN 連結作為備援）
- 支援搜尋、標籤篩選、隱式連結切換、節點面板等所有互動功能
- 可直接用瀏覽器開啟，**無需安裝 Python 或啟動任何伺服器**

---

## 專案結構

```
easy-knowledge-graph/
├── main.py              # FastAPI 應用程式進入點
├── pyproject.toml       # 專案設定與依賴宣告
├── create_sample.py     # 產生範例 Excel 資料
│
├── core/
│   ├── scanner.py       # 掃描 .xlsx 並解析 Meta 工作表
│   ├── graph_builder.py # NetworkX 圖建構與增量更新
│   └── watcher.py       # watchdog 資料夾監聽（asyncio 橋接）
│
├── api/
│   └── routes.py        # FastAPI 路由（REST + WebSocket）
│
├── frontend/
│   ├── index.html       # 主頁面（工具列、圖容器、面板框架）
│   ├── style.css        # 深色主題樣式
│   ├── graph.js         # D3.js 力導向圖、互動邏輯
│   └── panel.js         # 節點預覽面板、工作表切換
│
└── sample_data/         # 範例 Excel 檔（執行 create_sample.py 產生）
```

---

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| `GET` | `/` | 前端主頁面 |
| `GET` | `/api/graph` | 圖資料（D3 格式），支援 `?include_implicit=true` |
| `GET` | `/api/tags` | 所有標籤列表 |
| `GET` | `/api/node` | 節點詳情與工作表預覽，支援 `?id=&sheet=&limit=` |
| `POST` | `/api/refresh` | 觸發全圖重建 |
| `GET` | `/api/export` | 匯出內嵌所有資料的獨立 HTML |
| `WS` | `/ws/updates` | WebSocket 即時更新推播 |

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 後端 | [FastAPI](https://fastapi.tiangolo.com/) + [uvicorn](https://www.uvicorn.org/) |
| 圖計算 | [NetworkX](https://networkx.org/) |
| Excel 解析 | [openpyxl](https://openpyxl.readthedocs.io/) |
| 檔案監聽 | [watchdog](https://python-watchdog.readthedocs.io/) |
| 前端視覺化 | [D3.js v7](https://d3js.org/)（CDN，無需建置工具）|
| 套件管理 | [uv](https://docs.astral.sh/uv/) |

---

## License

MIT

---

<a name="english"></a>

# Easy Knowledge Graph — English

[繁體中文](#easy-knowledge-graph) | **English**

An interactive knowledge graph powered by Excel files, inspired by [Obsidian Graph View](https://obsidian.md/). Visualize and explore relationships between your local `.xlsx` files directly in the browser — no database, no cloud, just files.

---

## Features

- **Interactive force-directed graph** — D3.js force simulation with drag, zoom, and pan
- **Native Excel support** — Reads `.xlsx` files directly; no Office installation required
- **Meta Sheet spec** — Add a `Meta` worksheet to any file to define its title, tags, links, and description
- **Explicit + implicit links** — Links declared in Meta (explicit), plus auto-detected links when a cell value matches another file's title or filename (implicit)
- **Live sync** — watchdog monitors the data folder; changes push to the graph via WebSocket automatically
- **Content preview panel** — Click a node to open a side panel with paginated worksheet data (first 100 rows by default)
- **Tag filter & search** — Filter nodes by tag or text; related links are highlighted
- **Local view** — Double-click a node to show only that node and its direct neighbors
- **Standalone HTML export** — One click generates a single self-contained HTML file with all data embedded; no Python needed to view or share
- **Dark UI** — Default dark theme for comfortable long-session reading

---

## Requirements

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager

---

## Quick Start

### 1. Install dependencies

```bash
git clone https://github.com/heinzyao/easy-knowledge-graph.git
cd easy-knowledge-graph
uv sync
```

### 2. Generate sample data (optional)

```bash
uv run python create_sample.py
```

Creates 9 sample Excel files in `sample_data/` based on the **Apple iPhone supply chain**, with each file representing a real supplier:

| Tier | Company | Supply Item |
|------|---------|-------------|
| Tier 1 | TSMC | A-series chip fabrication (3nm/5nm) |
| Tier 1 | Samsung Electronics | LPDDR5 memory, NAND Flash |
| Tier 1 | Sony Semiconductor | CMOS image sensors |
| Tier 1 | Corning | Ceramic Shield screen glass |
| Tier 1 | Murata Manufacturing | MLCC capacitors, RF modules |
| Tier 0 Assembly | Foxconn | iPhone final assembly (70%) |
| Brand | Apple | Design, brand, supply chain management |
| Logistics | UPS | Global air freight delivery |
| Retail (no Meta) | Best Buy | End retail (implicit link demo) |

### 3. Start the server

```bash
# Use default sample_data/ folder
uv run python main.py

# Specify a custom data folder
uv run python main.py /path/to/your/excel/folder

# Specify a custom port (default is 8000)
uv run python main.py --port 8001

# Specify both folder and port
uv run python main.py /path/to/your/excel/folder --port 8001
```

The browser opens automatically at the local address.

---

## Excel File Format

### Meta worksheet (optional)

Add a worksheet named `Meta` to any `.xlsx` file. The first column is the key, the second is the value:

| Key | Example Value | Description |
|-----|---------------|-------------|
| title | Technical Spec | Node display name (defaults to filename) |
| tags | tech, backend, API | Comma-separated tags |
| links | Project Plan, DB Design | Comma-separated link targets (filename or title) |
| description | System architecture and API spec | Node description text |

### Implicit links

If a cell value exactly matches the title or filename of another file, the system automatically creates an implicit link (hidden by default; toggle via the toolbar).

---

## Controls

| Action | Function |
|--------|----------|
| Click a node | Open the content preview panel |
| Double-click a node | Enter local view (neighbors only) |
| Double-click background | Exit local view |
| Scroll / trackpad | Zoom |
| Drag background | Pan |
| Drag a node | Pin node position |
| Search box | Filter nodes by title in real time |
| Tag dropdown | Filter nodes by tag |
| Show implicit links | Toggle auto-detected implicit links |
| Refresh button | Manually rebuild the full graph |
| 📥 Export button | Download a standalone offline-shareable HTML file |

### Standalone HTML export

Click the **📥 Export** button in the toolbar. The browser downloads `knowledge-graph.html`, which:

- Embeds all node data, graph structure, and worksheet contents
- Embeds D3.js (downloaded at export time, with CDN fallback)
- Supports all interactive features: search, tag filter, implicit links, node panel
- Opens directly in any browser — **no Python or server required**

---

## Project Structure

```
easy-knowledge-graph/
├── main.py              # FastAPI application entry point
├── pyproject.toml       # Project config and dependencies
├── create_sample.py     # Generate sample Excel data
│
├── core/
│   ├── scanner.py       # Scan .xlsx and parse Meta worksheets
│   ├── graph_builder.py # NetworkX graph construction and incremental updates
│   └── watcher.py       # watchdog folder monitor (asyncio bridge)
│
├── api/
│   └── routes.py        # FastAPI routes (REST + WebSocket)
│
├── frontend/
│   ├── index.html       # Main page (toolbar, graph container, panel frame)
│   ├── style.css        # Dark theme styles
│   ├── graph.js         # D3.js force graph and interaction logic
│   └── panel.js         # Node preview panel and worksheet tabs
│
└── sample_data/         # Sample Excel files (generated by create_sample.py)
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Frontend main page |
| `GET` | `/api/graph` | Graph data (D3 format); supports `?include_implicit=true` |
| `GET` | `/api/tags` | List of all tags |
| `GET` | `/api/node` | Node details and worksheet preview; supports `?id=&sheet=&limit=` |
| `POST` | `/api/refresh` | Trigger full graph rebuild |
| `GET` | `/api/export` | Export standalone HTML with all data embedded |
| `WS` | `/ws/updates` | WebSocket real-time update push |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | [FastAPI](https://fastapi.tiangolo.com/) + [uvicorn](https://www.uvicorn.org/) |
| Graph computation | [NetworkX](https://networkx.org/) |
| Excel parsing | [openpyxl](https://openpyxl.readthedocs.io/) |
| File watching | [watchdog](https://python-watchdog.readthedocs.io/) |
| Frontend visualization | [D3.js v7](https://d3js.org/) (CDN, no build tools needed) |
| Package management | [uv](https://docs.astral.sh/uv/) |

---

## License

MIT

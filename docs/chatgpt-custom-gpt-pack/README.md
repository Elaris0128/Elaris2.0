# Elaris 自訂 GPT 上傳包

這一包是給 `ChatGPT 自訂 GPT` 用的。
目的不是重存整個資料庫，而是把 `最需要的遊玩知識` 壓成一組比較穩定、容易被檢索的檔案。

## 這包怎麼用
1. 到 ChatGPT 的 `Explore GPTs / Create`
2. 在 `Instructions` 貼上：
   - `00-custom-gpt-instructions-template.md`
3. 在 `Knowledge` 上傳：
   - `01-world-canon-priority-and-play-mode.md`
   - `02-world-playable-races-and-official-branches.md`
   - `03-world-start-regions-and-openings.md`
   - `04-character-creation-and-jobs.md`
   - `05-world-core-play-and-adjudication.md`
   - `06-items-inventory-and-crafting.md`
   - `07-combat-monsters-and-encounters.md`
   - `08-quests-reputation-and-licenses.md`
   - `09-campaign-continuity-and-ai-flow.md`
   - `12-world-retrieval-discipline-and-canon-answering.md`
   - `13-world-known-canon-pitfalls-and-frequent-misreads.md`
   - `14-world-overview-and-major-cultural-regions.md`
4. Capabilities 建議：
   - `Web Search`：先關掉
   - `Code Interpreter / Data Analysis`：可開
   - `Image`：可選
   - `Actions`：建議開，讓 GPT 可先查 Elaris lore API 再回答

## 如果你想照著一步一步做
先看這兩份：
- `11-beginner-step-by-step-setup-guide.md`
- `10-actions-setup-checklist.md`

## 為什麼這樣拆
- `Instructions` 放行為與裁定規則
- `Knowledge` 放世界觀與玩家規則摘要
- `12 / 13 / 14` 專門補：
  - 正典查證紀律
  - 常見誤判
  - 世界總覽與主要文化圈

## 如果之後要更新
最優先重傳的通常是：
- `02-world-playable-races-and-official-branches.md`
- `03-world-start-regions-and-openings.md`
- `12-world-retrieval-discipline-and-canon-answering.md`
- `13-world-known-canon-pitfalls-and-frequent-misreads.md`
- `14-world-overview-and-major-cultural-regions.md`

## 這包的定位
- 給 `自訂 GPT` 當遊玩核心知識
- 不取代完整世界資料庫
- 如果 GPT 沒有從知識檔中找到細節，應採 `保守推定`，而不是直接亂補正典
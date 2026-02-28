# Research: ゲーム画面レイアウト最適化

**Date**: 2026-02-28 | **Branch**: `003-game-layout-optimize`

---

## Decision 1: `h-dvh` vs `min-h-dvh`

**Decision**: `h-dvh` を使用（strict full viewport height）

**Rationale**:
- `min-h-dvh` は「少なくとも 100dvh」を意味し、コンテンツが多いと画面外にあふれる
- `h-dvh` は「ちょうど 100dvh」でコンテナを固定し、内部の flex 子要素が残余スペースを計算できる
- `dvh`（dynamic viewport height）は iOS Safari の下部バー表示/非表示を正しく考慮する
- PinInput を常に画面内に収めるためには strict な高さ拘束が必要

**Alternatives considered**:
- `min-h-screen` (`min-h-[100vh]`): 静的な viewport height で、iOS Safari の動的 UI バーを考慮しない
- `h-screen`: `100vh` は iOS Safari の動的バーを無視し、下部がバーに隠れることがある

---

## Decision 2: Flex 子要素の `min-h-0` 必要性

**Decision**: `flex-1` と組み合わせて `min-h-0` を必ず付与する

**Rationale**:
- Flexbox の仕様では flex アイテムの `min-height` は既定値 `auto`（= コンテンツサイズ）
- `min-height: auto` の場合、flex アイテムはコンテンツサイズより小さくなれない
- PinInput 内のグリッドが CSS Grid で展開されるため、コンテンツ高さが大きくなりがち
- `min-h-0` を付与することで「コンテンツより小さくなれる」状態にし、`flex-1` が正しく機能する
- 代替: `overflow: hidden/auto/scroll` も `min-height: auto` を 0 にリセットするが、意図が不明瞭

**Applies to**:
- 入力エリア div: `flex-1 min-h-0 flex flex-col`
- PinInput 内グリッド div: `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2`

---

## Decision 3: CSS Grid `grid-rows-3` でボタン高さを動的拡大

**Decision**: `grid-rows-3` (`grid-template-rows: repeat(3, minmax(0, 1fr))`) + デフォルト stretch

**Rationale**:
- グリッドコンテナが `flex-1 min-h-0` で flex 残余スペースを受け取る
- `grid-rows-3` = `repeat(3, minmax(0, 1fr))` → 3行を均等に残余高さへ分配
- CSS Grid のデフォルト `align-items: stretch` によりグリッドアイテムが行の高さいっぱいに伸びる
- ボタン側に `h-full` 等の追加クラスは不要（デフォルト stretch が機能する）
- `min-h-[44px]` を維持することで最小タッチターゲットサイズを保証

**Calculation for 6 players on iPhone SE (667px)**:
- PinInput gets: 667 - 60 (header) - 320 (scoreboard max) = 287px
- Overhead (p-4 + label + gaps): ~80px
- Available for buttons: 207px
- 0-button (`shrink-0 py-4`): ~48px
- Grid remaining: 207 - 48 - 12 (gap) = 147px
- Per row: 147 / 3 ≈ **49px ≥ 44px ✓**

**Alternatives considered**:
- 固定 `py-5` / `py-6` に変更: 静的で少人数時にスペースを活用できない
- `aspect-square` ボタン: 横方向にも影響し、グリッド幅が不均一になる恐れ

---

## Decision 4: ScoreBoard 高さ上限 `max-h-80` (320px)

**Decision**: `max-h-80` = `max-height: 20rem` = 320px

**Rationale**:
- 各プレイヤー行の高さ: `py-3`（24px）+ コンテンツ（text-xl + text-xs ≈ 36px）= ~60px
- 6行フル表示: 360px。ただし 320px で cap し 5.3 行相当を表示（残りはスクロール）
- 320px cap により PinInput が最低 287px (667px 画面) を確保 → ボタン 49px 達成
- `overflow-y-auto` と組み合わせで 6人時は最後の 1 行弱がスクロール可能
- `md:max-h-none` でタブレット以上は上限を解除し既存レイアウトを維持

**Alternatives considered**:
- `max-h-96` (384px): 6行フル表示可能だが PinInput が 607-384=223px となり、ボタンが ~35px になり 44px を下回る可能性
- 動的計算 (JS): 複雑すぎ、Constitution 原則 I（シンプルさ）に違反

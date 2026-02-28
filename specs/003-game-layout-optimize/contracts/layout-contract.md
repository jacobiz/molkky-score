# UI Layout Contract: ゲーム画面レイアウト

**Feature**: 003-game-layout-optimize
**Applies to**: GameScreen, MolkkoutScreen (モバイル縦向き)

---

## Contract 1: ゲーム画面コンテナ

| 属性 | 値 |
|------|----|
| 高さ | `h-dvh`（ビューポート高さにちょうど収まる） |
| 方向 | `flex-col`（モバイル）/ `flex-row`（md: 以上） |
| スクロール | コンテナ自体はスクロールしない |

---

## Contract 2: スコアボードエリア（モバイル）

| 属性 | 値 |
|------|----|
| 最大高さ | `max-h-80` = 320px |
| オーバーフロー | `overflow-y-auto`（320px 超で内部スクロール） |
| 縮小 | `shrink-0`（PinInput に圧迫されない） |
| md: 以上 | `flex-1 min-h-0 max-h-none`（制限解除） |

**Invariant**: スコアボードエリアの高さは最大 320px。6人時は最後の行付近がスクロール可能。

---

## Contract 3: スコア入力エリア（モバイル）

| 属性 | 値 |
|------|----|
| 高さ | `flex-1 min-h-0`（残余ビューポートをすべて取得） |
| 内部構造 | `flex flex-col`（縦積み） |
| md: 以上 | `flex-none w-80`（固定幅 320px） |

**Invariant**: スコア入力エリアはスクロールなしで常にビューポート内に表示される。

---

## Contract 4: スコア入力ボタン

| ボタン | クラス | 最小高さ |
|--------|--------|---------|
| 0（ミス） | `shrink-0 w-full py-4 rounded-2xl bg-red-500` | ~48px（固定 py-4） |
| 1〜12 グリッド | `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2` コンテナ内 | 44px (`min-h-[44px]`) |

**Invariant**:
- 0 ボタン: 常に `py-4` の固定高さ、`shrink-0` で縮まない
- 1〜12 ボタン: グリッド行が残余スペースを等分（`grid-rows-3` = `repeat(3, 1fr)`）
  → 6人ゲーム・iPhone SE でも各行 ≥ 44px
  → 少人数ゲームではさらに大きくなる

---

## Contract 5: md: 以上の互換性

| コンポーネント | モバイル | md: 以上 |
|--------------|----------|----------|
| 外コンテナ | `flex-col` | `flex-row` |
| スコアボード側 | `shrink-0` | `flex-1 min-h-0` |
| スコアボード max-h | `max-h-80` | `max-h-none` |
| 入力エリア | `flex-1 min-h-0` | `flex-none w-80` |
| PinInput | `h-full`（親を埋める） | `h-auto`（自然高さ、`md:justify-center` で中央） |

**Invariant**: md: 以上では本機能による視覚的変更はない（既存の横並びレイアウトを完全維持）。

# Implementation Plan: Game UI Polish

**Branch**: `004-game-ui-polish` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-game-ui-polish/spec.md`

## Summary

ゲーム中画面の UI を 5 点改善する：(1) ヘッダへの各プレイヤー個別投数の2段表示、(2) 残りスコア≤12の強調表示、(3) スコアボード文字サイズ拡大、(4) 主要ボタンへのアイコン/絵文字追加、(5) ゲーム内状態（脱落・バースト）の絵文字表示。すべて UI 変更のみで、新ライブラリ不要。投数は `turnHistory` から導出するため型定義変更なし。

## Technical Context

**Language/Version**: TypeScript 5.7（strict mode）
**Primary Dependencies**: React 19, TailwindCSS v4（`@tailwindcss/vite`）
**Storage**: localStorage（既存）
**Testing**: Vitest + @testing-library/react
**Target Platform**: Mobile-first PWA（iOS/Android/Chrome）
**Project Type**: Mobile web application（PWA）
**Performance Goals**: 主要操作レスポンス 100ms 以内（Constitution III）
**Constraints**: 追加ライブラリなし、既存レイアウト制約（h-dvh、max-h-80スコアボード）維持
**Scale/Scope**: 2〜6 プレイヤー、単一画面 SPA

## Constitution Check

### 原則 I: シンプルさ優先 ✅

- 投数は `turnHistory.filter(t => t.playerId === id).length + 1` で導出 — `Player` 型の変更なし
- アイコンはすべて Unicode 絵文字 — SVG ライブラリ・アイコンライブラリ不要
- 新コンポーネント不要 — 既存コンポーネントの修正のみ

### 原則 II: テストファースト ✅

- 投数導出は UI 表示ロジック（スコア計算・ゲームルールではない）→ テスト任意
- 残りスコア強調は `50 - player.score <= 12` の条件式 → 同上
- 既存テスト（scoring.test.ts / gameReducer.test.ts）への変更なし

### 原則 III: モバイルファースト・PWA ✅

- 全変更はタッチ操作の視認性・直感性向上が目的
- オフライン動作に影響なし（絵文字は Unicode、ネットワーク不要）

**Complexity Tracking**: 違反なし

## Project Structure

### Documentation (this feature)

```text
specs/004-game-ui-polish/
├── plan.md              ← このファイル
├── research.md          ← Phase 0 出力
├── data-model.md        ← Phase 1 出力
├── contracts/
│   └── i18n-keys.md     ← Phase 1 出力（追加 key の contract）
└── tasks.md             ← /speckit.tasks コマンドで生成
```

### Source Code（変更対象ファイル）

```text
src/
├── i18n/
│   ├── ja.ts              ← game.throwCount 追加
│   └── en.ts              ← game.throwCount 追加（序数関数）
├── components/
│   ├── GameScreen/
│   │   ├── index.tsx      ← ヘッダ2段化・投数表示・undoアイコン
│   │   └── ScoreBoard.tsx ← フォントサイズ拡大・残り強調・脱落アイコン
│   ├── HomeScreen.tsx     ← ボタンアイコン追加
│   ├── SetupScreen.tsx    ← ゲーム開始ボタンアイコン追加
│   └── ResultScreen.tsx   ← シェア・もう一度ボタンアイコン追加（🏆は実装済み）
└── [types/game.ts]        ← 変更なし（投数は turnHistory から導出）

specs/001-molkky-score/contracts/
└── i18n-keys.md           ← game.throwCount コントラクト更新
```

**Structure Decision**: 既存 Single-project 構造を維持。新規ファイルなし。

## Implementation Notes

### 投数導出ロジック

```text
// GameScreen/index.tsx 内で計算
const throwCount = game.turnHistory.filter(
  t => t.playerId === currentPlayer.id
).length + 1
```

- `turnHistory` が空（ゲーム開始直後）→ `0 + 1 = 1` → 「1投目」✓
- undo 後は `turnHistory` が縮まるため自動的に正しい数値になる ✓
- 脱落・勝利後はゲーム終了なので投数表示は不要

### 残りスコア強調

```text
// ScoreBoard.tsx 内
const remaining = 50 - player.score
const isCloseToWin = remaining <= 12 && !isEliminated && !isWinner
```

- 12点以下かつ active の場合のみ強調
- バースト後（25点リセット）は remaining=25 となり自動解除

### 絵文字候補（implementation reference）

| 場所 | 絵文字 |
|------|--------|
| undo ボタン | ↩️ |
| 新規ゲーム | ▶️ |
| ゲーム再開 | ▶️ |
| ゲーム開始（setup） | ▶️ |
| 結果シェア | 📤 |
| もう一度プレイ | 🔄 |
| 脱落バッジ | ❌ |
| バーストトースト | 💥 |
| 優勝（result） | 🏆（実装済み） |

### 注意点

- `ResultScreen.tsx` の優勝者 🏆 表示は**すでに実装済み**（FR-011 は実質完了）
- i18n の `bustMessage` / `eliminatedMessage` 文字列に絵文字を含める形で FR-012 を実現
  - `game.bustMessage`: `'💥 バースト！25点にリセット'`
  - `game.eliminatedMessage`: `'❌ {name} が脱落しました'`
- 絵文字をボタンに追加する際は `aria-label` 等のアクセシビリティ対応は不要（テキストと併用のため）

# Data Model: UI Layout Fixes

**Feature**: 020-ui-layout-fixes
**Date**: 2026-03-07

## Summary

データモデル変更なし。

本機能はすべてUI表示レイアウトの調整であり、以下のいずれも変更しない:
- `localStorage` スキーマ（`molkky-score-v2`）
- `GameState` / `Game` 型（`src/types/game.ts`）
- `GameHistoryRecord` 型（`src/types/history.ts`）

## 50点ハイライト判定の根拠

`ScoreSheetModal` が受け取る `GameHistoryRecord.turns[].scoreAfter` フィールドには、そのターン後の確定スコア（バスト時は25にリセット済み）が格納されている。

| 状況 | `scoreAfter` | `isBust` | ハイライト |
|------|-------------|----------|-----------|
| 50点ちょうど達成（勝利） | `50` | `false` | ✅ 適用 |
| 50点超過（バスト→25にリセット） | `25` | `true` | ❌ 不適用 |
| 通常スコア | その他 | `false` | ❌ 不適用 |

条件 `entry.scoreAfter === 50` で勝利ターンを一意に特定できる。追加フィールド不要。

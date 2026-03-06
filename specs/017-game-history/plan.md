# Implementation Plan: ゲーム結果履歴

**Branch**: `017-game-history` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-game-history/spec.md`

## Summary

通常ゲーム終了時に結果を自動保存し、ホーム画面から専用の履歴一覧スクリーン（`HistoryScreen`）で
参照できる機能を追加する。各履歴からはターン×プレイヤーのスコアシートモーダル（`ScoreSheetModal`）
を開ける。履歴データは既存スキーマを変更せず別 localStorage キーに保存する。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: React Context + useReducer（追加ライブラリなし）、TailwindCSS v4
**Storage**: localStorage — 新規キー `molkky-score-history`（既存 `molkky-score-v2` は変更なし）
**Testing**: Vitest（主要ロジック: `buildHistoryRecord`、`historyStorage` の CRUD）
**Target Platform**: PWA（iOS / Android / Desktop ブラウザ）
**Performance Goals**: 一覧表示 1秒以内（SC-002）、主要操作 100ms 以内（Constitution III）
**Constraints**: localStorage 容量制限対策として最大20件制限
**Scale/Scope**: 最大20件の履歴、最大10人のプレイヤー

## Constitution Check

| 原則 | 評価 | 備考 |
|------|------|------|
| I. シンプルさ優先 | ✅ PASS | 追加ライブラリなし。既存パターン（NAVIGATE/Screen）を踏襲 |
| II. テストファースト（主要機能のみ） | ✅ PASS | `buildHistoryRecord` のユニットテストを先行実装 |
| III. モバイルファースト・PWA | ✅ PASS | 横スクロール対応、タッチ操作最適化 |
| 品質ゲート: TypeScript | ✅ PASS | strict mode 維持 |
| 品質ゲート: テストパス | ✅ PASS | 主要機能テスト必須 |

**Complexity Tracking**: 不要（Constitution 違反なし）

## Project Structure

### Documentation (this feature)

```text
specs/017-game-history/
├── spec.md              ✅
├── plan.md              ✅ (this file)
├── research.md          ✅
├── data-model.md        ✅
├── quickstart.md        ✅
└── tasks.md             （/speckit.tasks で生成）
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── game.ts                  # Screen 型に 'history' を追加
│   └── history.ts               # 新規: GameHistoryRecord, HistoryTurnEntry, StoredHistory
├── utils/
│   ├── historyStorage.ts        # 新規: 履歴 CRUD (load/add/remove)
│   └── storage.ts               # 変更なし
├── reducers/
│   └── gameReducer.ts           # 'history' NAVIGATE 対応のみ追加（保存ロジックは Context 側）
├── context/
│   └── GameContext.tsx          # dispatch ラッパーでゲーム終了後に saveHistory を呼び出し
├── components/
│   ├── HistoryScreen.tsx        # 新規: 履歴一覧スクリーン
│   ├── HomeScreen.tsx           # 「履歴」ボタン追加
│   └── ui/
│       └── ScoreSheetModal.tsx  # 新規: スコアシートモーダル
└── i18n/
    ├── ja.ts                    # history セクション追加
    ├── en.ts                    # 同上
    └── fi.ts                    # 同上

tests/unit/
└── historyStorage.test.ts       # 新規: historyStorage の CRUD テスト
```

**Structure Decision**: 既存の単一プロジェクト構造を踏襲。新規ファイルは最小限（4ファイル）。

## 実装方針

### Phase 1（基盤）: 型定義・ストレージ・変換ロジック

1. `src/types/history.ts` — `GameHistoryRecord`、`HistoryTurnEntry`、`StoredHistory` の定義
2. `src/utils/historyStorage.ts` — `loadHistory()`、`addRecord()`、`removeRecord()` の実装
3. `tests/unit/historyStorage.test.ts` — CRUD テスト（TDD: テスト先行）
4. `src/types/game.ts` — `Screen` 型に `'history'` を追加

### Phase 2（保存ロジック）: 履歴の自動保存

5. `src/context/GameContext.tsx` — ゲーム終了（`status: 'finished'`）検出後に `addRecord()` 呼び出し
6. `buildHistoryRecord(game)` 変換関数を `historyStorage.ts` または `history.ts` に実装

### Phase 3（UI）: 履歴一覧・スコアシート表示

7. `src/i18n/ja.ts` / `en.ts` / `fi.ts` — `history` i18n キー追加
8. `src/components/ui/ScoreSheetModal.tsx` — スコアシートモーダル
9. `src/components/HistoryScreen.tsx` — 履歴一覧スクリーン（削除機能含む）
10. `src/components/HomeScreen.tsx` — 「履歴」ボタン追加
11. `src/App.tsx` — `HistoryScreen` の条件レンダリング追加

### Phase 4（確認）

12. TypeScript コンパイルエラーなし: `npm run build`
13. 全ユニットテストパス: `npm test`
14. 各クイックスタートシナリオの目視確認

## i18n キー設計（`ja.ts` 追加分）

```typescript
history: {
  title: '履歴',
  empty: 'まだゲーム履歴がありません',
  deleteButton: '削除',
  deleteConfirm: 'この履歴を削除しますか？',
  scoreSheet: 'スコアシート',
  closeButton: '閉じる',
  turns: 'ターン',
  timeoutBadge: '⏱ 時間切れ',
  drawLabel: '引き分け',
  turnHeader: 'ターン',
}
```

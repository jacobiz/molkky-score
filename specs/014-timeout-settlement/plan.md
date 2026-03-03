# Implementation Plan: 時間切れによる途中決着

**Branch**: `014-timeout-settlement` | **Date**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/014-timeout-settlement/spec.md`

## Summary

ゲーム進行中に「途中決着」ボタンを追加し、現時点の最高スコアで勝敗を決定する。通常ゲームと Mölkkout の両方に対応。`Game` と `MolkkoutGame` に `finishReason: 'normal' | 'timeout'` フィールドを追加し、ストレージスキーマを v3 → v4 に更新。引き分けは複数プレイヤー/チームを `'winner'` 状態に設定することで表現する。

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: React Context + useReducer、TailwindCSS v4、Vite 6.1、vite-plugin-pwa 0.21
**Storage**: localStorage（key: `molkky-score-v2`、SCHEMA_VERSION: 3 → 4）
**Testing**: Vitest + @testing-library/react
**Target Platform**: Mobile PWA（iOS / Android）、オフライン動作必須
**Project Type**: PWA（モバイル Web アプリ）
**Performance Goals**: 主要操作 100ms 以内（Constitution III）
**Constraints**: TypeScript strict mode、外部ライブラリ追加なし（Constitution I）
**Scale/Scope**: 単一デバイス、2〜10プレイヤー、オフライン環境

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| コンポーネントは単一責務 | ✅ Pass | 途中決着ロジックは reducer に集約、UI は表示のみ |
| 追加ライブラリ最小限 | ✅ Pass | 新規依存なし、既存 `ConfirmDialog` 再利用 |
| 将来拡張の先取りなし | ✅ Pass | タイマー機能などはスコープ外と明示 |
| 主要機能のテスト先行 | ✅ Pass | reducer の EARLY_SETTLEMENT をテスト対象と決定 |
| モバイルファースト | ✅ Pass | 既存 UI パターンに従う、新ボタンはタッチ最適化 |
| TypeScript strict | ✅ Pass | 全変更を strict mode 準拠で実施 |

**Complexity Tracking**: 違反なし（新規複雑さの導入なし）

## Project Structure

### Documentation (this feature)

```text
specs/014-timeout-settlement/
├── plan.md              ✅ このファイル
├── research.md          ✅ Phase 0 出力
├── data-model.md        ✅ Phase 1 出力
├── quickstart.md        ✅ Phase 1 出力
├── contracts/
│   └── actions.md       ✅ Phase 1 出力
└── tasks.md             Phase 2 出力（/speckit.tasks コマンド）
```

### Source Code (変更対象ファイル)

```text
src/
├── types/
│   └── game.ts              # Game・MolkkoutGame に finishReason 追加、GameAction 拡張
├── reducers/
│   └── gameReducer.ts       # EARLY_SETTLEMENT・EARLY_MOLKKOUT_SETTLEMENT ハンドラ追加
├── utils/
│   └── storage.ts           # SCHEMA_VERSION 3→4、StoredState 更新
├── components/
│   ├── GameScreen/
│   │   └── index.tsx        # 途中決着ボタン追加（ConfirmDialog 利用）
│   ├── MolkkoutScreen/
│   │   └── index.tsx        # 途中決着ボタン追加（ConfirmDialog 利用）
│   └── ResultScreen.tsx     # ⏱バッジ追加、複数勝者表示対応
└── i18n/
    ├── ja.ts                # 新規キー追加（+ Messages 型定義更新）
    ├── en.ts                # 同上
    └── fi.ts                # 同上

tests/unit/
└── earlySettlement.test.ts  # 新規テストファイル（TDD: 実装前に作成）
```

**Structure Decision**: 単一プロジェクト構成（既存 Option 1 に準拠）。新ファイルはテストのみ。

## Implementation Phases

### Phase A: テスト先行（Constitution 必須）

1. `tests/unit/earlySettlement.test.ts` を作成（失敗状態で）
2. テスト内容:
   - `EARLY_SETTLEMENT` 単独勝者ケース
   - `EARLY_SETTLEMENT` 引き分けケース
   - `EARLY_SETTLEMENT` 脱落プレイヤー除外ケース
   - `EARLY_SETTLEMENT` no-op ケース（スコア全 0）
   - `EARLY_MOLKKOUT_SETTLEMENT` 単独・引き分けケース

### Phase B: 型・ロジック実装

1. `game.ts` — `finishReason` フィールド追加、新アクション型追加
2. `gameReducer.ts` — `EARLY_SETTLEMENT` / `EARLY_MOLKKOUT_SETTLEMENT` ハンドラ実装
3. `gameReducer.ts` — `START_GAME` / `START_MOLKKOUT` に `finishReason: 'normal'` 初期値追加
4. テスト実行 → すべてパスすることを確認

### Phase C: ストレージ更新

1. `storage.ts` — `SCHEMA_VERSION: 4`、`StoredState` に `finishReason` フィールドを含む型更新

### Phase D: i18n

1. `ja.ts` — 新規キー追加（`earlySettlement`、`earlySettlementConfirm`、`timeoutBadge`、`draw`、`drawWinners`）
2. `en.ts` / `fi.ts` — 同等キー追加

### Phase E: UI 実装

1. `GameScreen/index.tsx` — 途中決着ボタン + ConfirmDialog
2. `MolkkoutScreen/index.tsx` — 途中決着ボタン + ConfirmDialog
3. `ResultScreen.tsx` — ⏱ バッジ、複数勝者表示

## 設計上のキーポイント

### 引き分け表現

```
winnerId = null  +  status = 'finished'  +  finishReason = 'timeout'
  → players.filter(p => p.status === 'winner') で複数勝者を取得
```

### ボタン表示条件

```typescript
// 通常ゲーム
const showEarlySettlement = game.players.some(p => p.status === 'active' && p.score > 0)

// Mölkkout
const showEarlySettlement = mg.teams.some(t => t.totalScore > 0) && mg.status !== 'finished'
```

### ConfirmDialog 再利用

既存の `<ConfirmDialog>` コンポーネントをそのまま利用。
追加の UI コンポーネントは不要。

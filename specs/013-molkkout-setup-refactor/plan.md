# Implementation Plan: Mölkkout セットアップ改修

**Branch**: `013-molkkout-setup-refactor` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-molkkout-setup-refactor/spec.md`

---

## Summary

Mölkkout（タイブレーカー）のセットアップ画面を改修する。プレイヤー名入力フィールドを削除し、代わりに「1チームあたりの総投球数」をステッパー（1〜10）で指定できるようにする。ゲーム画面はプレイヤー名表示をなくし、投球進捗（例:「4投中2投目」）を表示する。Undo 機能をゲーム画面に追加し、チーム境界をまたぐ取り消しに対応する。`MolkkoutGame` の型を全面的に刷新し、`SCHEMA_VERSION` を 3 に上げて旧データを安全に破棄する。

---

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode) + React 19
**Primary Dependencies**: React 19, Vite 6.1, TailwindCSS v4, vite-plugin-pwa 0.21
**Storage**: localStorage — key `molkky-score-v2`, `SCHEMA_VERSION: 2 → 3`
**Testing**: Vitest + @testing-library/react
**Target Platform**: PWA (iOS / Android モバイル、オフライン対応)
**Project Type**: mobile-first PWA (frontend-only)
**Performance Goals**: 主要操作 100ms 以内（コンスティテューション III）
**Constraints**: オフライン動作、TypeScript strict、新規外部ライブラリ追加なし
**Scale/Scope**: 2〜6チーム × 1〜10投、単一ユーザー操作

---

## Constitution Check

*GATE: Phase 0 リサーチ前確認。Phase 1 設計後に再確認済み。*

| 原則 | 判定 | 備考 |
|------|------|------|
| I. シンプルさ優先 | ✅ Pass | 新規ライブラリなし。ステッパーはインライン実装（ui/ への抽出なし）。既存 `<Toast>` を再利用。 |
| II. テストファースト | ✅ Pass | `molkkoutReducer.test.ts` をリデューサー実装前に更新・失敗確認してから実装を開始する。 |
| III. モバイルファースト・PWA | ✅ Pass | タッチ最適化 (+/− ボタン)、オフライン動作は PWA 設定により継続。 |
| 品質ゲート | ✅ Pass | 全テストパス + TypeScript コンパイルエラーなし + 不要な複雑さなし。 |

**Constitution Check 再評価（Phase 1 設計後）**: 追加違反なし。

---

## Project Structure

### Documentation (this feature)

```text
specs/013-molkkout-setup-refactor/
├── plan.md              # このファイル
├── research.md          # Phase 0 output — 全 NEEDS CLARIFICATION 解消済み
├── data-model.md        # Phase 1 output — 型変更・リデューサーロジック詳細
├── quickstart.md        # Phase 1 output — 実行順序・手動テストシナリオ
├── contracts/
│   └── i18n-keys.md    # Phase 1 output — i18n キー差分・コンポーネント Props 変更
└── tasks.md             # Phase 2 output (/speckit.tasks コマンドで生成)
```

### Source Code (変更対象ファイル)

```text
src/
├── types/
│   └── game.ts                    # MolkkoutTeam / MolkkoutTurn / MolkkoutGame / GameAction 更新
├── utils/
│   └── storage.ts                 # SCHEMA_VERSION: 2 → 3
├── reducers/
│   └── gameReducer.ts             # START_MOLKKOUT 改修 / RECORD_MOLKKOUT_TURN 改修 / UNDO_MOLKKOUT_TURN 追加
├── i18n/
│   ├── ja.ts                      # molkkout 名前空間: キー削除・追加・変更
│   ├── en.ts                      # 同上
│   └── fi.ts                      # 同上
└── components/
    ├── MolkkoutSetupScreen.tsx    # 全面改修 (プレイヤー名削除・ステッパー追加・Toast バリデーション)
    └── MolkkoutScreen/
        └── index.tsx              # 投球進捗表示・Undo ボタン追加

tests/unit/
└── molkkoutReducer.test.ts        # 新 API に合わせて更新 + Undo テスト追加
```

**Structure Decision**: Single-project PWA（Option 1）。フロントエンドのみで完結し、バックエンドや API なし。

---

## 実装計画

### Step 1: 型定義 (`src/types/game.ts`)

**目的**: 他すべてのファイルが依存する型を先に確定する。

変更内容:
- `MolkkoutTeam`: `playerNames` フィールド削除
- `MolkkoutTurn`: `playerName` 削除 / `teamIndex`, `throwIndex`, `prevStatus` 追加
- `MolkkoutGame`: `currentPlayerInTeamIndex`, `throwsPerPlayer` 削除 / `currentThrowIndex`, `totalThrows` 追加
- `GameAction`:
  - `START_MOLKKOUT` ペイロード変更: `{ name: string }[]` + `totalThrows: number`
  - `UNDO_MOLKKOUT_TURN` アクション追加

---

### Step 2: ストレージ (`src/utils/storage.ts`)

**目的**: 旧スキーマ（バージョン 2）のデータを安全に破棄する。

変更内容:
- `SCHEMA_VERSION = 2` → `SCHEMA_VERSION = 3`
- `isValidStoredState` の変更不要（既存の `v.version !== SCHEMA_VERSION` チェックで自動対応）

---

### Step 3: テスト先行 (`tests/unit/molkkoutReducer.test.ts`)

**目的**: コンスティテューション II（テストファースト）に従い、実装前にテストを書いて失敗確認。

更新内容:
- `startMolkkout` ヘルパー: `playerNames` 廃止 → `totalThrows` 引数化
- `completeCurrentTeam` ヘルパー: `throwsPerPlayer * playerNames.length` → `totalThrows` に変更
- 既存テスト: 新 API に合わせて修正（ロジック変更なし）
- 新規テスト追加:
  - `UNDO_MOLKKOUT_TURN`: 同チーム内 undo
  - `UNDO_MOLKKOUT_TURN`: チーム境界またぎ undo
  - `UNDO_MOLKKOUT_TURN`: `turns.length === 0` で state 変化なし
  - `UNDO_MOLKKOUT_TURN`: `finished` 状態からの undo

---

### Step 4: リデューサー (`src/reducers/gameReducer.ts`)

**目的**: ゲームロジックの実体。テスト通過を目標とする。

変更内容:
- `START_MOLKKOUT`:
  - `playerNames` 非格納
  - `throwsPerPlayer` 非計算
  - `currentThrowIndex: 0`, `totalThrows: action.totalThrows` を初期化
- `RECORD_MOLKKOUT_TURN`:
  - `currentPlayerInTeamIndex` 廃止 → `currentThrowIndex` ベースの切替ロジック
  - `MolkkoutTurn` に `teamIndex`, `throwIndex`, `prevStatus` を記録
  - 勝者判定・overtime ロジックは変更なし（FR-008）
- `UNDO_MOLKKOUT_TURN` 追加（詳細は `data-model.md` 参照）

---

### Step 5: i18n (`src/i18n/ja.ts`, `en.ts`, `fi.ts`)

**目的**: UI が参照する文字列を確定。

変更内容（`contracts/i18n-keys.md` 参照）:
- 削除: `teamTurn`, `errorRequiredFields`
- 追加: `teamTurnLabel`, `throwProgress`, `totalThrowsLabel`, `errorTeamRequired`, `errorDuplicateTeam`
- `ja.ts` を先に変更 → TypeScript が `en.ts`/`fi.ts` の型不一致を即座に検出

---

### Step 6: セットアップ画面 (`src/components/MolkkoutSetupScreen.tsx`)

**目的**: FR-001〜005 を実現する UI。

変更内容:
- プレイヤー名 input グループを完全削除
- `addPlayer` / `updatePlayerName` 関数を削除
- local state: `teams: { name: string }[]`, `totalThrows: number` (初期値 3), `toast: string | null`
- ステッパー（+/−）: `totalThrows` を 1〜10 で変更。境界でボタン `disabled`
- バリデーション（`handleStart`）:
  1. 空チーム名 → `t.molkkout.errorTeamRequired` トースト
  2. 重複チーム名 → `t.molkkout.errorDuplicateTeam` トースト
- `<Toast>` コンポーネントを import し、`toast` state に応じて表示
- dispatch: `{ type: 'START_MOLKKOUT', teams, totalThrows }`

---

### Step 7: ゲーム画面 (`src/components/MolkkoutScreen/index.tsx`)

**目的**: FR-006〜010 を実現する UI。

変更内容:
- `currentPlayerName` 派生削除
- ヘッダー:
  - チーム名: `t.molkkout.teamTurnLabel.replace('{team}', currentTeam.name)`
  - 投球進捗: `t.molkkout.throwProgress(mg.currentThrowIndex + 1, mg.totalThrows)`
  - `pinSetupGuide` 行は削除（セットアップ画面のみに表示）
- Undo ボタン追加:
  - `disabled={mg.turns.length === 0}`
  - `onClick={() => dispatch({ type: 'UNDO_MOLKKOUT_TURN' })}`
  - ラベル: `t.game.undo`（既存キー流用）

---

## Complexity Tracking

> 本機能に Constitution 違反なし。このセクションは空。

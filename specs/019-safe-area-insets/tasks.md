# Tasks: Safe Area Insets (Apple HIG準拠の外周余白)

**Input**: Design documents from `/specs/019-safe-area-insets/`
**Prerequisites**: plan.md ✅, spec.md ✅, quickstart.md ✅

**Tests**: テスト不要（CSS/HTML変更のみ。主要機能=スコア計算ロジックへの変更なし）

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: PWAステータスバー設定とCSS基盤の整備

- [x] T001 [P] `apple-mobile-web-app-status-bar-style` を `default` から `black-translucent` に変更する (`index.html` line 10)
- [x] T002 TailwindCSS v4 カスタムユーティリティ `@utility safe-top / safe-bottom / safe-x` を追加する (`src/index.css`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全非ホーム画面のトップ安全領域を一括カバーする共有コンポーネントの変更

**⚠️ CRITICAL**: `ScreenHeader` は6画面で使われるため、この変更を完了させてからUS1実装を開始する

- [x] T003 `ScreenHeader` の `<header>` を `h-14 items-center` から `items-end pb-3 safe-top` に変更する (`src/components/ui/ScreenHeader.tsx` line 31)

**Checkpoint**: ScreenHeader を使用する全画面（SetupScreen・GameScreen・ResultScreen・MolkkoutSetupScreen・MolkkoutScreen・HistoryScreen）のトップ安全領域が対応済み

---

## Phase 3: User Story 1 - ノッチ・Dynamic Island周辺のコンテンツが隠れない (Priority: P1) 🎯 MVP

**Goal**: iPhone のノッチ・Dynamic Island・ホームインジケーター環境で、すべての画面のコンテンツとボタンがシステムUIと重ならず表示される

**Independent Test**: iPhone（ノッチあり/Dynamic Islandあり）で PWA をフルスクリーン起動し、全8画面を遷移してコンテンツがステータスバー・ホームインジケーターと重ならないことを目視確認

### Implementation for User Story 1

- [x] T004 [P] [US1] `HomeScreen` の root `<div>` に `safe-top safe-bottom` を追加する（`ScreenHeader` を持たない唯一の通常画面）(`src/components/HomeScreen.tsx` line 40)
- [x] T005 [P] [US1] `GameScreen` のピン入力ボトムコンテナ（`flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-2/5 md:justify-center`）に `safe-bottom` を追加する (`src/components/GameScreen/index.tsx` line 106)
- [x] T006 [P] [US1] `MolkkoutScreen` の入力ボトムコンテナ（`flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-80 md:justify-center`）に `safe-bottom` を追加する (`src/components/MolkkoutScreen/index.tsx` line 159)
- [x] T007 [P] [US1] `ScoreSheetModal` のモバイルボトムシートコンテナ（`bg-white rounded-t-2xl sm:rounded-2xl shadow-xl ...`）に `safe-bottom` を追加する (`src/components/ui/ScoreSheetModal.tsx` line 62)

**Checkpoint**: この時点で US1 のすべての受け入れシナリオが検証可能。iPhone PWA でフルスクリーン確認を実施する

---

## Phase 4: User Story 2 - 安全領域なし端末での最低余白保証 (Priority: P2)

**Goal**: Android や旧 iPhone など安全領域が 0 の端末でも、コンテンツと画面端の間に最低 16px 相当の余白が確保される

**Independent Test**: Android ブラウザまたはデスクトップブラウザの DevTools（Responsive モード）で各画面を確認し、コンテンツと画面端の間に 16px 以上の余白があることを確認

### Implementation for User Story 2

- [x] T008 [US2] 各画面の既存パディングが `env(safe-area-inset-*, 0px)` フォールバック（= 0）でも最低16px以上を維持しているか確認する（`HomeScreen`: `px-6 pt-12`、`SetupScreen`: `p-4`、`GameScreen`: `px-4`、`ResultScreen`: `p-4`、`HistoryScreen`: `px-4`）— 既存パディングで要件を満たすことを確認し、問題があれば不足している画面に `px-4` 相当を追加する

**Checkpoint**: 安全領域なし端末でも全画面が最低16px余白を持つことを確認

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: ビルド確認・動作検証・横向き対応確認

- [x] T009 `npm run build` を実行して TypeScript コンパイルエラーがないことを確認する
- [x] T010 [P] `npm test` を実行して既存ユニットテスト（91件）がすべてパスすることを確認する
- [ ] T011 quickstart.md の「動作確認方法」に従って iOS Safari/PWA および Android Chrome で目視確認を実施する（ステータスバー透過・ノッチ回避・ホームインジケーター回避の3点を iOS で、最低余白16px以上を Android で確認）
- [x] T012 [P] 横向き（ランドスケープ）表示で各画面の左右が安全領域に侵食されないことを確認し、`safe-x` ユーティリティ（T002 で定義済み）を必要なコンポーネントのルートコンテナへ適用する（FR-004 MUST 要件）(`src/components/HomeScreen.tsx` ほか各画面 root div)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — 即座に開始可能
- **Foundational (Phase 2)**: Setup 完了後に開始 — US1・US2の作業を**ブロック**する
- **User Story 1 (Phase 3)**: Foundational 完了後に開始 — T004〜T007 はすべて並列実行可能
- **User Story 2 (Phase 4)**: Foundational 完了後に開始 — US1 と並列作業可能（確認タスクのみ）
- **Polish (Phase 5)**: すべての US が完了した後に実施

### User Story Dependencies

- **US1 (P1)**: Phase 2（ScreenHeader 変更）完了後に開始。独立して実装・テスト可能
- **US2 (P2)**: Phase 2 完了後に開始。US1 と並列作業可能（既存パディングの確認のみ）

### Within User Story 1

- T004・T005・T006・T007 はすべて異なるファイルを操作するため並列実行可能
- T003（Foundational）の完了が前提

### Parallel Opportunities

- **Phase 1**: T001 と T002 は別ファイルなので並列実行可能
- **Phase 3**: T004〜T007 はすべて並列実行可能（異なるコンポーネント）
- **Phase 5**: T009・T010・T012 は並列実行可能

---

## Parallel Example: User Story 1

```bash
# T003 完了後、以下を並列実行:
Task T004: "HomeScreen.tsx に safe-top safe-bottom 追加"
Task T005: "GameScreen/index.tsx ボトムコンテナに safe-bottom 追加"
Task T006: "MolkkoutScreen/index.tsx ボトムコンテナに safe-bottom 追加"
Task T007: "ScoreSheetModal.tsx ボトムシートに safe-bottom 追加"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 完了: T001（status-bar-style 変更）+ T002（CSS utilities）
2. Phase 2 完了: T003（ScreenHeader 変更）← CRITICAL
3. Phase 3 完了: T004〜T007 を並列実行
4. **STOP and VALIDATE**: iPhone PWA でフルスクリーン確認
5. 問題なければ US2（T008）と Polish（T009〜T012）に進む

### Incremental Delivery

1. Setup + Foundational → ScreenHeader 経由で6画面のトップ安全領域が即座に機能
2. US1 追加 → 残り画面（HomeScreen）とボトムエリア・モーダルに対応
3. US2 確認 → 全端末での最低余白保証を確認
4. Polish → ビルド・テスト・実機確認

---

## Notes

- [P] tasks = different files, no dependencies — 並列実行推奨
- `env(safe-area-inset-*, 0px)` のフォールバック `0px` により、安全領域がない端末では既存パディングがそのまま機能する
- `ConfirmDialog`・`PinSetupGuideModal`・`InstallHelpModal` は垂直中央配置のため safe area 対応不要
- `ScoreSheetModal` のみモバイルでボトムシート表示のため `safe-bottom` が必要
- `viewport-fit=cover` は既に `index.html` に設定済み（追加作業不要）
- TypeScript 変更なし（className 属性のみ）— 型エラーは発生しない

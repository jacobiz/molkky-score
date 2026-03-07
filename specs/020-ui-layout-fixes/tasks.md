# Tasks: UI Layout Fixes

**Input**: Design documents from `/specs/020-ui-layout-fixes/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Organization**: 4つの独立したUI変更。各フェーズが個別に実装・検証可能。新規ファイル・テスト・依存関係なし。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（異なるファイル、依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US4）

---

## Phase 1: User Story 1 - Scoresheet Print/Close Button Spacing (Priority: P1) 🎯 MVP

**Goal**: スコアシートモーダルの印刷ボタンと閉じるボタンの間隔を広げ、誤タップを防ぐ。

**Independent Test**: スコアシートモーダルを開き、印刷ボタン（🖨）と閉じるボタン（✕）の間に明確な視覚的スペースがあり、誤タップなく独立して押せることを確認する。

### Implementation

- [x] T001 [P] [US1] `src/components/ui/ScoreSheetModal.tsx` line 79: ボタンコンテナの `gap-1` を `gap-3` に変更する

**Checkpoint**: スコアシートモーダルのヘッダーで2つのボタンが十分な間隔で表示される

---

## Phase 2: User Story 2 - Pin Input Area Height Constraint (Priority: P2)

**Goal**: ピン入力パネルを使用可能ビューポート高さの最大40%に制限し、スコアボードが常に見えるようにする。

**Independent Test**: アクティブゲーム画面を開き、ピン入力パネルが画面下40%（ボトムセーフエリア除く）を超えず、スコアボードがその上に見えることを確認する。

### Implementation

- [x] T002 [P] [US2] `src/components/GameScreen/index.tsx` line 106: ピン入力コンテナ div に `max-h-[calc(40dvh-env(safe-area-inset-bottom,0px))] overflow-y-auto` を追加し、md ブレイクポイントでは `md:max-h-none md:overflow-visible` で制限を解除する

**Checkpoint**: 任意の画面サイズでピン入力パネルがビューポート40%を超えず、内部スクロールが機能する

---

## Phase 3: User Story 3 - Remove Language Selector from Player Name Setup (Priority: P3)

**Goal**: プレイヤー名入力画面から言語セレクターを削除し、設定フローをシンプルにする。

**Independent Test**: プレイヤー名入力画面を開き、言語セレクターが表示されないこと、かつ既存の言語設定が変更されないことを確認する。

### Implementation

- [x] T003 [P] [US3] `src/components/SetupScreen.tsx` line 4: `import { LanguageSelector } from './ui/LanguageSelector'` を削除する
- [x] T004 [US3] `src/components/SetupScreen.tsx` lines 77–80: `<ScreenHeader>` の `rightContent={<LanguageSelector ... />}` プロップを削除する（T003 完了後）

**Checkpoint**: プレイヤー名入力画面に言語セレクターが表示されず、言語設定は維持される

---

## Phase 4: User Story 4 - Scoresheet 50-Point Cell Highlight (Priority: P4)

**Goal**: スコアシートで累計スコアが50点に達したセルを緑でハイライトし、勝利ターンを視覚的に識別できるようにする。

**Independent Test**: 50点到達済みのゲーム履歴のスコアシートを開き、累計スコア「50」のセルが他のセルと明確に異なる緑背景で表示されることを確認する。バスト（25にリセット）セルや通常セルはハイライトされない。

### Implementation

- [x] T005 [US4] `src/components/ui/ScoreSheetModal.tsx` lines 148–152: `<td>` の className 配列に `entry.scoreAfter === 50 ? 'bg-green-100' : ''` を追加する
- [x] T006 [US4] `src/components/ui/ScoreSheetModal.tsx` line 157: 累計スコア表示 `<span>` の className 配列に `entry.scoreAfter === 50 ? 'text-green-700 font-bold' : ''` を追加する（T005 完了後）

**Checkpoint**: 50点到達セルが `bg-green-100 text-green-700 font-bold` で表示され、bust/eliminated/通常セルと視覚的に区別できる

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: ビルド確認と目視確認

- [x] T007 [P] `npm run build` を実行し TypeScript コンパイルエラーがないことを確認する
- [x] T008 [P] `npm test` を実行し既存テストが全パスすることを確認する（constitution 品質ゲート）
- [ ] T009 各変更をモバイル表示（iOS/Android相当）で目視確認する:
  - US1: 印刷/閉じるボタン間隔
  - US2: ピン入力エリア高さ制限（40%以下）
  - US3: プレイヤー名設定画面に言語セレクター非表示
  - US4: 50点到達セルの緑ハイライト

---

## Dependencies & Execution Order

### Phase Dependencies

- **全フェーズ独立**: T001〜T006 は互いに依存しない（US3 内の T003→T004 を除く）
- **同一ファイル内**: T001 (US1) と T005/T006 (US4) は同じファイル `ScoreSheetModal.tsx` を変更するため順次実行
- **Polish (Phase 5)**: 全実装フェーズ完了後

### User Story Dependencies

- **US1 (P1)**: 依存なし — 即時開始可能
- **US2 (P2)**: 依存なし — US1 と並行実行可能
- **US3 (P3)**: 依存なし — US1/US2 と並行実行可能
- **US4 (P4)**: `ScoreSheetModal.tsx` を US1 と共有 — US1 完了後に実行推奨

### Parallel Opportunities

- **T001 / T002 / T003**: 異なるファイル → 並行実行可能
- **T004**: T003 完了後のみ（同一ファイル、import 削除が前提）
- **T005 / T006**: T001 完了後に順次実行（同一ファイル）

---

## Parallel Example

```bash
# 並行実行可能なグループ:
Group A: T001 (ScoreSheetModal gap 変更)
Group B: T002 (GameScreen pin input 高さ制限)
Group C: T003 → T004 (SetupScreen 言語セレクター削除)

# Group A 完了後:
Group D: T005 → T006 (ScoreSheetModal 50点ハイライト)

# 全完了後:
Group E: T007, T008, T009 (ビルド確認・テスト確認・目視確認)
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. T001 を完了
2. **STOP and VALIDATE**: スコアシートモーダルのボタン間隔を確認
3. 問題なければ残りのフェーズへ

### 推奨実行順（1人開発）

1. T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009
2. 各フェーズのチェックポイントで目視確認
3. 全完了後に `npm run build` でコンパイル確認

---

## Notes

- 全変更は既存ファイルへのインライン変更のみ（新規ファイルなし）
- コア機能（スコア計算・ゲームルール）の変更なし → 新規テスト不要
- `env(safe-area-inset-bottom, 0px)` は TailwindCSS v4 の arbitrary value 構文で有効
- `entry.scoreAfter === 50` は `isBust` チェック不要（バスト時は常に `scoreAfter === 25`）

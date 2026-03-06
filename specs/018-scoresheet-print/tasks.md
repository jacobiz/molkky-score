# Tasks: スコアシート印刷機能

**Input**: Design documents from `/specs/018-scoresheet-print/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Organization**: タスクはユーザーストーリー単位で整理。US1（ScoreSheetModal への印刷追加）が MVP。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2）

---

## Phase 1: Setup（印刷 CSS 基盤）

**Purpose**: `@media print` CSS ルールを追加してモーダル印刷の基盤を作る

- [X] T001 `@media print`（visibility トリック）と `@page`（A4 横向き）ルールを `src/index.css` に追加する。具体的には: (1) `body * { visibility: hidden }` / `.scoresheet-print-area, .scoresheet-print-area * { visibility: visible }` / `.scoresheet-print-area { position: absolute; top: 0; left: 0; width: 100%; overflow: visible }` の 3 ルール、(2) `.print-hide { visibility: hidden !important }` ルール（モーダル内ボタン非表示用）、(3) `@page { size: A4 landscape; margin: 1cm }` の計 3 ブロックを追加する

**Checkpoint**: `src/index.css` に `.scoresheet-print-area`・`.print-hide` の両クラスを制御するルールと `@page` ルールが存在する

---

## Phase 2: Foundational（i18n キー追加）

**Purpose**: 両ユーザーストーリーが使用する印刷ボタンのラベルを i18n に追加する

**⚠️ CRITICAL**: US1・US2 の実装前に完了が必要

- [X] T002 [P] `history.printButton`（印刷ボタン aria-label）と `history.printScoreSheet`（結果画面ボタンラベル）の 2 キーを `src/i18n/ja.ts` の `history` セクションに追加する
- [X] T003 [P] 同 2 キー（英語: `'Print'`, `'Print Score Sheet'`）を `src/i18n/en.ts` の `history` セクションに追加する
- [X] T004 [P] 同 2 キー（フィンランド語: `'Tulosta'`, `'Tulosta pistelomake'`）を `src/i18n/fi.ts` の `history` セクションに追加する

**Checkpoint**: 3 言語すべてで `t.history.printButton` と `t.history.printScoreSheet` が参照可能。TypeScript コンパイルエラーなし

---

## Phase 3: User Story 1 — 履歴スコアシートの印刷 (Priority: P1) 🎯 MVP

**Goal**: ScoreSheetModal に印刷ボタンを追加し、印刷時にモーダルコンテンツのみが表示される

**Independent Test**: 履歴画面でスコアシートモーダルを開く → 🖨 ボタンを押すとブラウザ印刷ダイアログが開く。印刷プレビューにはスコアシートのみが表示され、背景・ボタン類は非表示になっている

### Implementation for User Story 1

- [X] T005 [US1] `src/components/ui/ScoreSheetModal.tsx` を修正する: (1) モーダル本体コンテナ div（`bg-white rounded-t-2xl ...`）に `scoresheet-print-area` クラスを追加する。(2) ヘッダー右側（閉じるボタンの左隣）に `onClick={() => window.print()}` の印刷ボタン（`aria-label={t.history.printButton}`）を追加し、そのボタンに `print-hide` クラスを付与する。(3) 閉じるボタン（`✕`）にも `print-hide` クラスを付与する。(4) ヘッダーの `<p className="text-xs text-gray-500">` 行に `record.finishedAt` を `toLocaleDateString()` でフォーマットした日時と `record.players.map(p => p.name).join(' → ')` による投球順プレイヤーリストを追加する（FR-003 対応）

**Checkpoint**: US1 完全動作 — ScoreSheetModal の印刷ボタンでダイアログが開き、プレビューにはスコアシートのみ表示される

---

## Phase 4: User Story 2 — 結果画面からのスコアシート印刷 (Priority: P2)

**Goal**: ResultScreen に「スコアシートを印刷」ボタンを追加し、ScoreSheetModal を経由して印刷できる

**Independent Test**: ゲームを完了して ResultScreen を表示 → 「スコアシートを印刷」ボタンを押すと ScoreSheetModal が開く → モーダル内の印刷ボタンで印刷ダイアログが起動する

### Implementation for User Story 2

- [X] T006 [US2] `src/components/ResultScreen.tsx` を修正する: `useState<boolean>(false)`（`showScoreSheet`）を追加し、`loadHistory` と `ScoreSheetModal` を import する。`const latestRecord = loadHistory()[0] ?? null` をコンポーネント内で定義する。アクションボタンエリア（シェアボタンの下）に `latestRecord` が存在する場合のみ「🖨 {t.history.printScoreSheet}」ボタンを表示し、押下で `setShowScoreSheet(true)` を呼ぶ。`showScoreSheet && latestRecord` の場合に `<ScoreSheetModal record={latestRecord} onClose={() => setShowScoreSheet(false)} />` をレンダリングする

**Checkpoint**: US1・US2 ともに動作 — ResultScreen の印刷ボタン → モーダル → 印刷ダイアログのフロー完結

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: ビルド確認と品質検証

- [X] T007 `npm run build` を実行して TypeScript コンパイルエラーがないことを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (CSS)**: 依存なし — 即開始可能
- **Phase 2 (i18n)**: 依存なし — Phase 1 と並列実行可能
- **Phase 3 (US1)**: Phase 1 + Phase 2 の完了が必要（T001〜T004 完了後）
- **Phase 4 (US2)**: Phase 3 完了が必要（T005 完了後 — ResultScreen で ScoreSheetModal を再利用するため）
- **Phase 5 (Polish)**: Phase 4 完了後

### User Story Dependencies

- **US1 (P1)**: T001〜T004 完了後に開始可能
- **US2 (P2)**: T005（US1）完了後に開始可能（ScoreSheetModal を再利用）

### Parallel Opportunities

- T002・T003・T004（i18n 3ファイル）は完全に並列実行可能
- T001 と T002〜T004 は異なるファイルのため並列実行可能

---

## Parallel Example: Phase 2

```
並列実行可能:
  T002: src/i18n/ja.ts に printButton/printScoreSheet キー追加
  T003: src/i18n/en.ts に同キー追加
  T004: src/i18n/fi.ts に同キー追加
```

---

## Implementation Strategy

### MVP（US1 のみ）

1. T001: `src/index.css` に `@media print` 追加
2. T002〜T004: i18n キー追加（並列）
3. T005: `ScoreSheetModal` に印刷ボタン追加
4. **STOP and VALIDATE**: 履歴画面で印刷フロー動作確認
5. 検証 OK なら US2 へ

### 完全実装

1. Phase 1 + Phase 2 完了（T001〜T004）
2. Phase 3 完了（T005）→ US1 動作確認
3. Phase 4 完了（T006）→ US2 動作確認
4. Phase 5: ビルド確認

---

## Notes

- [P] タスクは異なるファイルを対象とし依存関係なし
- T005・T006 は同一ファイルへの変更なし（それぞれ別ファイル）のため順序は問わないが、T006 が T005 のコンポーネントを import するため論理的に T005 → T006 の順序で進める
- `loadHistory()` は `src/utils/historyStorage.ts` からのインポート（既存）
- `ScoreSheetModal` は `src/components/ui/ScoreSheetModal.tsx` からのインポート（既存）

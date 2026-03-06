# Tasks: ゲーム結果履歴

**Input**: Design documents from `/specs/017-game-history/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: US1（履歴一覧）・US2（スコアシート）が P1、US3（削除）が P2。
US2・US3 は US1 の `HistoryScreen` 実装に積み上げるため US1 完了後に開始する。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[US1]**: ユーザーストーリー1（履歴一覧の参照）に対応
- **[US2]**: ユーザーストーリー2（スコアシートの参照）に対応
- **[US3]**: ユーザーストーリー3（履歴の削除）に対応

---

## Phase 1: Foundational（共通基盤）

**Purpose**: 全ユーザーストーリーが依存する型定義・ストレージ・i18n を整備する

**⚠️ CRITICAL**: Constitution II に従い、`historyStorage` のテストを実装前に作成する（TDD）

- [x] T001 `src/types/history.ts` を新規作成: `HistoryTurnEntry`・`GameHistoryRecord`・`StoredHistory` 型を定義する（data-model.md 参照）
- [x] T002 `src/types/game.ts` の `Screen` 型に `'history'` を追加する
- [x] T003 `tests/unit/historyStorage.test.ts` を新規作成: `loadHistory`・`addRecord`・`removeRecord`・`buildHistoryRecord` のユニットテストを記述する（TDD: 実装前に FAIL を確認すること）
- [x] T004 `src/utils/historyStorage.ts` を新規作成: `loadHistory()`・`addRecord()`・`removeRecord()`・`buildHistoryRecord()` を実装する（T001・T003 完了後。`Game.turnHistory` から `GameHistoryRecord` に変換するロジックを含む。最大20件超過時は末尾の最古レコードを削除）
- [x] T005 [P] `src/i18n/ja.ts` に `history` セクションを追加する: `title: '履歴'`・`empty: 'まだゲーム履歴がありません'`・`deleteButton: '削除'`・`deleteConfirm: 'この履歴を削除しますか？'`・`scoreSheet: 'スコアシート'`・`closeButton: '閉じる'`・`turns: 'ターン'`・`timeoutBadge: '⏱ 時間切れ'`・`drawLabel: '引き分け'`
- [x] T006 [P] `src/i18n/en.ts` に `history` セクションを追加する（T005 と同内容の英語版）
- [x] T007 [P] `src/i18n/fi.ts` に `history` セクションを追加する（T005 と同内容のフィンランド語版）

**Checkpoint**: `npm test` で historyStorage テストが全通過すること

---

## Phase 2: User Story 1 - 履歴一覧の参照 (Priority: P1) 🎯 MVP

**Goal**: ゲーム終了後に自動保存された履歴をホーム画面から一覧表示できる

**Independent Test**: 通常ゲームを完了させ、ホーム画面の「履歴」ボタンから `HistoryScreen` に遷移すると、直前のゲームが一覧の先頭に表示されることを確認する

- [x] T008 [US1] `src/context/GameContext.tsx` にゲーム終了後の自動保存ロジックを追加する: `dispatch` ラッパー内で `RECORD_TURN`・`EARLY_SETTLEMENT` 実行後に `game.status === 'finished'` を検出し `addRecord(buildHistoryRecord(game))` を呼び出す（T004 完了後）
- [x] T009 [P] [US1] `src/components/HistoryScreen.tsx` を新規作成する: `loadHistory()` で取得した履歴を最新順にリスト表示する。各カードには終了日時・参加者名・勝者名（または「引き分け」）・ターン数・途中決着バッジを表示する。履歴0件の場合は `t.history.empty` の空状態メッセージを表示する。`<ScreenHeader>` で「ホームへ戻る」ナビゲーションを設ける（T005–T007 完了後）
- [x] T010 [US1] `src/App.tsx` に `state.screen === 'history'` の条件レンダリングで `<HistoryScreen />` を追加する（T009 完了後）
- [x] T011 [US1] `src/components/HomeScreen.tsx` に「履歴」ボタンを追加する: `dispatch({ type: 'NAVIGATE', screen: 'history' })` で遷移する（T002・T010 完了後）

**Checkpoint**: 通常ゲーム完了 → ホーム画面 → 「履歴」 → `HistoryScreen` に遷移し直前のゲームが表示されることを目視確認する

---

## Phase 3: User Story 2 - ターンごとスコアシートの参照 (Priority: P1)

**Goal**: 履歴一覧の任意のゲームをタップするとスコアシートモーダルが開き、全ターンを確認できる

**Independent Test**: `HistoryScreen` でゲームカードをタップすると `ScoreSheetModal` が開き、行：ラウンド番号（全プレイヤーの1投目が1行目）・列：プレイヤー名の表形式でスコアが表示されることを確認する

- [x] T012 [US2] `src/components/ui/ScoreSheetModal.tsx` を新規作成する: `GameHistoryRecord` を受け取りターン番号×プレイヤー名のテーブルを表示する。各セルには投点と累計スコアを表示する。バーストは赤系・脱落は打ち消し線等で視覚的に識別する。途中決着の場合はモーダルヘッダーに `t.history.timeoutBadge` を表示する。モーダル外タップまたは閉じるボタンで閉じる（T001・T005–T007 完了後）
- [x] T013 [US2] `src/components/HistoryScreen.tsx` にスコアシートモーダルの呼び出しを追加する: 履歴カードタップで `selectedRecord` ステートを更新し `<ScoreSheetModal>` を表示する（T012 完了後）

**Checkpoint**: バーストや脱落が含まれるゲームのスコアシートを開き、視覚的な識別が正しく表示されることを確認する

---

## Phase 4: User Story 3 - 履歴の削除 (Priority: P2)

**Goal**: 不要な履歴を個別に削除できる

**Independent Test**: 履歴一覧の削除ボタンをタップ → 確認ダイアログ → 「削除」で該当カードが一覧から消えることを確認する

- [x] T014 [US3] `src/components/HistoryScreen.tsx` に削除機能を追加する: 各カードに削除ボタンを設け、タップ時に `<ConfirmDialog>` で確認する。「削除」選択時に `removeRecord(id)` を呼び出してステートを更新する（T013 完了後）

**Checkpoint**: 削除後にページリロードしても削除済みレコードが表示されないことを確認する

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: ビルド確認・テスト確認・目視検証

- [x] T015 TypeScript コンパイルエラーがないことを確認する: `npm run build`
- [x] T016 全ユニットテストがパスすることを確認する: `npm test`
- [x] T017 [P] quickstart.md シナリオ1〜4を目視確認する（自動保存・一覧表示・スコアシート・削除が正常に動作すること）
- [x] T018 [P] quickstart.md シナリオ5〜7を目視確認する（最大20件制限・空状態・アプリ再起動後のデータ保持が正常に動作すること）。また 20件ロード後の一覧表示が体感上即時（SC-002 相当）であることを確認する

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Phase 1 (Foundational)**: 依存なし。T001–T007 はすべて即座に開始可能
  - ただし T003 は T001 完了後、T004 は T001・T003 完了後
  - T005・T006・T007 は T001 と独立して並列実行可能
- **Phase 2 (US1)**: Phase 1（特に T004・T005–T007）完了後
  - T008 は T004 に依存
  - T009 は T005–T007 に依存
  - T010 は T009 に依存
  - T011 は T002・T010 に依存
- **Phase 3 (US2)**: Phase 1 完了後（T009 と独立して並列開始可能）
  - T012: T001・T005–T007 完了後に開始可能（T009 不要）
  - T013: T012・T009 両方完了後
- **Phase 4 (US3)**: Phase 2 完了後（T009 必要）
  - T014: T009 完了後
- **Phase 5 (Polish)**: Phase 1–4 完了後

### ユーザーストーリー内の並列実行

```
Phase 1:
  T001 → T003 → T004（直列）
  T001 と並列で実行可能: T005 / T006 / T007

Phase 2（T004, T005–T007 完了後）:
  T008, T009 は並列実行可能
  T010 → T011（T009 完了後に直列）

Phase 3（T001, T005–T007 完了後）:
  T012（T009 と並列開始可能）
  T013（T012・T009 両方完了後）
```

### Parallel Example

```
同時実行可能（Phase 1）:
  T005: src/i18n/ja.ts の history セクション追加
  T006: src/i18n/en.ts の history セクション追加
  T007: src/i18n/fi.ts の history セクション追加

T001 完了後に開始:
  T003: historyStorage のテスト作成

T001・T003 完了後に開始:
  T004: historyStorage の実装

↓ T004・T005–T007 完了後

同時実行可能（Phase 2 と Phase 3）:
  T008: GameContext に自動保存ロジック追加
  T009: HistoryScreen 実装
  T012: ScoreSheetModal 実装
```

---

## Implementation Strategy

### MVP（US1 + US2 で最小価値を提供）

1. Phase 1 完了（基盤整備）
2. Phase 2 完了（US1: 履歴一覧）
3. Phase 3 完了（US2: スコアシート）
4. **STOP and VALIDATE**: quickstart.md シナリオ1〜3 を目視確認
5. リリース可能な状態

### 完全版（US3 追加）

1. MVP 完了後
2. Phase 4 完了（US3: 削除機能）
3. Phase 5（Polish・全シナリオ確認）

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [US?] ラベルは spec.md のユーザーストーリー番号に対応
- T003 は TDD: Constitution II の「主要機能のテストは実装前に記述」に従い T004 より先に作成
- `buildHistoryRecord()` は `Game.turnHistory[].playerSnapshotBefore` から `scoreAfter`・`isEliminated` を導出する（data-model.md 参照）
- 新規依存ライブラリなし
- Mölkkout の履歴はスコープ外（clarify で確定済み）

# Tasks: Mölkkout セットアップ改修

**Input**: Design documents from `/specs/013-molkkout-setup-refactor/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: コンスティテューション II（テストファースト）により、主要ゲームロジックのテストは必須。

**Organization**: フェーズ 1 は基盤（型・ストレージ・i18n）、フェーズ 2 は TDD（先行テスト）、フェーズ 3〜4 はユーザーストーリー別。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: 対象ユーザーストーリー（US1 / US2）
- 全タスクに絶対パスに準ずるファイルパスを明記

---

## Phase 1: Foundational（基盤 — 全 US をブロック）

**目的**: 型定義・ストレージ・i18n を更新する。これが完了するまで実装フェーズに進めない。

**⚠️ CRITICAL**: これらのタスクが完了するまでユーザーストーリー実装は開始できない。型変更後は TypeScript コンパイルエラーが多数発生する — それは正常。後続フェーズで解消する。

- [X] T001 `src/types/game.ts` の `MolkkoutTeam` インターフェースを更新: `playerNames: string[]` フィールドを削除し `id`, `name`, `totalScore` のみにする
- [X] T002 `src/types/game.ts` の `MolkkoutTurn` インターフェースを更新: `playerName: string` を削除し、Undo 用フィールド `teamIndex: number`, `throwIndex: number`, `prevStatus: 'active' | 'overtime'` を追加する
- [X] T003 `src/types/game.ts` の `MolkkoutGame` インターフェースを更新: `currentPlayerInTeamIndex` と `throwsPerPlayer` を削除し `currentThrowIndex: number` と `totalThrows: number` を追加する
- [X] T004 `src/types/game.ts` の `GameAction` Union 型を更新: `START_MOLKKOUT` のペイロードを `{ teams: { name: string }[]; totalThrows: number }` に変更し、`{ type: 'UNDO_MOLKKOUT_TURN' }` アクションを追加する
- [X] T005 `src/utils/storage.ts` の `SCHEMA_VERSION` を `2` から `3` に変更する（`isValidStoredState` の変更は不要）
- [X] T006 `src/i18n/ja.ts` の `molkkout` 名前空間を更新する: `teamTurn` と `errorRequiredFields` を削除し、`teamTurnLabel`, `throwProgress`, `totalThrowsLabel`, `errorTeamRequired`, `errorDuplicateTeam` を追加する（詳細は `contracts/i18n-keys.md` を参照）
- [X] T007 [P] `src/i18n/en.ts` を T006 と同じ構造変更で更新する（`Messages` 型に従い英語訳を入力）
- [X] T008 [P] `src/i18n/fi.ts` を T006 と同じ構造変更で更新する（`Messages` 型に従いフィンランド語訳を入力）

**チェックポイント**: T001〜T008 完了後、型エラーが多数あるのは正常。次フェーズでテストを追加し、その後リデューサー・UI を修正する。

---

## Phase 2: TDD — 先行テスト（実装前に失敗確認）

**目的**: コンスティテューション II に従い、リデューサー実装前にテストを記述して失敗を確認する。

**⚠️ NOTE**: このフェーズのテストは実装前に**必ず失敗する**こと。失敗しない場合は型変更が正しく反映されていない可能性がある。

- [X] T009 `tests/unit/molkkoutReducer.test.ts` のヘルパー関数 `startMolkkout` を更新する: `playersPerTeam` 引数を `totalThrows: number = 3` 引数に変更し、`{ type: 'START_MOLKKOUT', teams: [...], totalThrows }` を dispatch するよう修正する
- [X] T010 `tests/unit/molkkoutReducer.test.ts` の `completeCurrentTeam` ヘルパーを更新する: 投球回数算出を `playerNames.length * throwsPerPlayer` から `mg.totalThrows` に変更する
- [X] T011 `tests/unit/molkkoutReducer.test.ts` の既存テスト群（チームローテーション・overtime・勝者決定）を新 API に合わせて修正する（ゲームロジック自体の変更なし、ヘルパー呼び出し・期待値のみ更新）。SC-003 の境界値カバレッジとして `startMolkkout(6, 10)` を使った「6チーム × 10投の正しいローテーション」テストケースを 1 件追加する
- [X] T012 `tests/unit/molkkoutReducer.test.ts` に `UNDO_MOLKKOUT_TURN` テストスイートを追加する（以下を含む）:
  - `turns.length === 0` の場合に state が変化しないこと
  - 同チーム内での 1 投 Undo（スコア・`currentThrowIndex` が元に戻る）
  - チーム境界をまたぐ Undo（チーム B の 1 投目 Undo → チーム A の最終投球状態に戻る）
  - `status === 'finished'` の状態から Undo（`status` が 'active' または 'overtime' に戻る）

**チェックポイント**: `npm test` を実行してテストが**失敗**することを確認してから次フェーズへ進む。

- [X] T012b `npm test` を実行し `UNDO_MOLKKOUT_TURN` 関連テストが**赤（失敗）** であることをターミナル出力で確認する（コンスティテューション II — 実装前の失敗確認 MUST）

---

## Phase 3: User Story 1 — チーム名と総投球数を設定して Mölkkout を開始 (Priority: P1) 🎯 MVP

**Goal**: プレイヤー名なしでチーム名と総投球数（ステッパー）を入力し、Mölkkout ゲームを開始できる。

**Independent Test**: `MolkkoutSetupScreen` を開き、2 チームの名前を入力して投球数ステッパーで 3 → 4 に変更し「開始」をタップ → ゲーム画面が開き `mg.totalThrows === 4` であることを確認。Toast バリデーション（空欄・重複チーム名）も手動確認。

### Implementation for User Story 1

- [X] T013 [US1] `src/reducers/gameReducer.ts` の `START_MOLKKOUT` ケースを更新する: `playerNames` を格納しない、`throwsPerPlayer` を計算しない、`currentThrowIndex: 0` と `totalThrows: action.totalThrows` で `MolkkoutGame` を初期化する
- [X] T014 [US1] `src/components/MolkkoutSetupScreen.tsx` を全面改修する:
  - local state: `teams: { name: string }[]`（初期値: `[{name:''}, {name:''}]`）, `totalThrows: number`（初期値: `3`）, `toast: string | null`（初期値: `null`）
  - プレイヤー名 input グループ・`updatePlayerName`・`addPlayer` 関数をすべて削除する
  - 投球数ステッパー UI を追加する: `−` ボタン（`disabled={totalThrows <= 1}`）、投球数表示、`+` ボタン（`disabled={totalThrows >= 10}`）、ラベルは `t.molkkout.totalThrowsLabel`
  - `handleStart` バリデーション: 空チーム名 → `setToast(t.molkkout.errorTeamRequired)`、重複チーム名 → `setToast(t.molkkout.errorDuplicateTeam)`
  - エラー表示を `<p className="text-red-500">` から `<Toast>` コンポーネント（`src/components/ui/Toast.tsx`）に変更する
  - dispatch: `{ type: 'START_MOLKKOUT', teams: teams.map(t => ({ name: t.name.trim() })), totalThrows }`

**チェックポイント**: `npm test` でテスト通過を確認（T013 でリデューサーが修正されるため T009〜T012 のテストの一部が通過するはず）。US1 独立テストを手動実行する。

---

## Phase 4: User Story 2 — プレイヤー追跡なしの Mölkkout ゲーム画面 (Priority: P2)

**Goal**: ゲーム画面がプレイヤー名を表示せず、投球進捗（例:「4投中2投目」）と Undo ボタンを表示する。

**Independent Test**: Mölkkout ゲームを開始し: (1) ヘッダーに「チームA のターン / 3投中1投目」が表示される、(2) プレイヤー名フィールドがない、(3) Undo ボタンが disabled、(4) 1投記録後に Undo → スコアと投球インデックスが元に戻る、(5) チーム切替直後に Undo → 前チームの最終投球状態に戻る。

### Tests for User Story 2 ⚠️ TDD

> **NOTE**: T012 で Undo テストは作成済み。T015〜T016 でリデューサーを実装してテストを通過させる。

### Implementation for User Story 2

- [X] T015 [US2] `src/reducers/gameReducer.ts` の `RECORD_MOLKKOUT_TURN` ケースを更新する:
  - `currentPlayerInTeamIndex` / `throwsPerPlayer` / `playerName` の参照を削除する
  - `currentThrowIndex` ベースの切替ロジックに変更: `isTeamDone = mg.currentThrowIndex + 1 >= mg.totalThrows`
  - `MolkkoutTurn` に Undo フィールドを追加: `teamIndex: mg.currentTeamIndex`, `throwIndex: mg.currentThrowIndex`, `prevStatus: mg.status`
  - 勝者判定・overtime ロジックは変更しない（FR-008）
- [X] T016 [US2] `src/reducers/gameReducer.ts` に `UNDO_MOLKKOUT_TURN` ケースを追加する:
  - `mg.turns.length === 0` なら state を返す（no-op）
  - 最後のターンを pop して `lastTurn` に取り出す
  - 対象チームの `totalScore` から `lastTurn.points` を引く
  - `currentTeamIndex ← lastTurn.teamIndex`, `currentThrowIndex ← lastTurn.throwIndex`, `status ← lastTurn.prevStatus`, `winnerId ← null` を復元する
- [X] T017 [US2] `src/components/MolkkoutScreen/index.tsx` を更新する:
  - `currentPlayerName` の派生を削除する
  - ヘッダーのチーム表示: `t.molkkout.teamTurnLabel.replace('{team}', currentTeam.name)`
  - 投球進捗表示を追加: `t.molkkout.throwProgress(mg.currentThrowIndex + 1, mg.totalThrows)`（チームターン行の下または右に小テキストで）
  - `t.molkkout.pinSetupGuide` 行をヘッダーから削除する（setup 画面のみに表示）
  - Undo ボタンを MolkkoutInput の上または下に追加する: `disabled={mg.turns.length === 0}`, `onClick={() => dispatch({ type: 'UNDO_MOLKKOUT_TURN' })}`, ラベルは `t.game.undo`

**チェックポイント**: `npm test` で全テストが通過することを確認。US2 独立テストを手動実行する。

---

## Phase 5: Polish & Cross-Cutting

**目的**: 型安全・テスト完全性・手動シナリオ確認。

- [X] T018 `npx tsc --noEmit` を実行し TypeScript コンパイルエラーがないことを確認する。エラーがある場合は修正する
- [X] T019 `npm test` を実行し全ユニットテスト（gameReducer・molkkoutReducer・scoring・storage）がパスすることを確認する
- [ ] T020 `quickstart.md` の手動テストシナリオを全て実行し動作を確認する（セットアップ・バリデーション・Undo・旧データ互換性）。加えて以下を確認する: (1) 2チームセットアップをストップウォッチで計測し 30 秒以内に完了すること（SC-001）、(2) iPhone Safari または Android Chrome での実機動作確認（品質ゲート）、(3) 機内モード（オフライン）でアプリが正常動作すること（品質ゲート）
- [X] T021 [P] `npm run build` を実行しプロダクションビルドが成功することを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Foundational)
  T001 → T002 → T003 → T004   (同ファイル: 順次実行)
  T005                         (独立: T001〜T004 と並列可)
  T006 → [T007, T008 並列]    (ja.ts が Messages 型を定義するため T006 先行)

Phase 2 (TDD)  ← T001〜T008 完了後
  T009 → T010 → T011 → T012  (同ファイル: 順次実行)

Phase 3 (US1)  ← Phase 1+2 完了後
  T013 → T014                 (リデューサー先行、UI がそれに依存)

Phase 4 (US2)  ← Phase 1+2+3 完了後
  [T015, T016 順次] → T017   (RECORD→UNDO→UI の順)

Phase 5 (Polish)  ← Phase 4 完了後
  [T018, T019, T021 並列] → T020
```

### User Story Dependencies

- **US1 (P1)**: Phase 1 完了後に開始可能。他の US への依存なし。
- **US2 (P2)**: Phase 1 + US1 完了後に開始（リデューサーの START_MOLKKOUT が US2 のテストに影響するため）。

### Parallel Opportunities

- **T005** (storage.ts): T001〜T004 と並列実行可能
- **T007, T008** (en.ts, fi.ts): T006 完了後に互いに並列実行可能
- **T018, T019, T021** (polish 検証): 互いに並列実行可能

---

## Parallel Example: Phase 1

```bash
# i18n 更新を並列実行（T006 完了後）:
Task T007: "src/i18n/en.ts の molkkout セクションを更新"
Task T008: "src/i18n/fi.ts の molkkout セクションを更新"
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. Phase 1: Foundational（T001〜T008）を完了
2. Phase 2: TDD（T009〜T012）— テストが失敗することを確認
3. Phase 3: US1（T013〜T014）— テストが通過することを確認
4. **STOP and VALIDATE**: セットアップ画面を手動テスト
5. 問題なければ Phase 4 (US2) へ

### Incremental Delivery

1. T001〜T008（基盤）→ 2. T009〜T012（TDD）→ 3. T013〜T014（US1 MVP）→ 4. T015〜T017（US2）→ 5. T018〜T021（仕上げ）

---

## Notes

- [P] タスク = 異なるファイル、依存なし → 並列実行可能
- T001〜T004 は同一ファイル（`game.ts`）への連続編集 — 順次実行すること
- T009〜T012 は同一ファイル（`molkkoutReducer.test.ts`）への連続編集 — 順次実行すること
- Phase 2 完了後、`npm test` でテストが**失敗**することを必ず確認してから Phase 3 へ進む
- 各フェーズのチェックポイントで独立テストを実施し、問題を早期発見する
- `SCHEMA_VERSION: 3` により旧データは自動的に破棄される（FR-009 準拠）— 追加の migration コード不要

# Tasks: 得点直接入力（1タップスコア入力）

**Input**: Design documents from `/specs/002-direct-score-input/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Constitution 原則 II に従い、型変更に伴うテスト更新を実装より先に行う。

**Organization**: Foundational（型・ロジック・テスト）→ US1（通常ゲーム UI）→ US2（Mölkkout UI）

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、未完了タスクへの依存なし）
- **[Story]**: 対応するユーザーストーリー（US1〜US2、spec.md より）
- 各タスクには正確なファイルパスを記載

---

## Phase 1: Setup

Setup 不要（既存プロジェクトへの機能変更のため）

---

## Phase 2: Foundational（型・ロジック・テスト変更）

**Purpose**: 型定義・スコアリング関数・Reducer・ストレージの変更。US1/US2 両方の前提条件。

**⚠️ CRITICAL**: Constitution 原則 II に従い、テスト更新を型・実装変更より先に行う。

- [x] T001 [P] `tests/unit/scoring.test.ts` から `calculatePoints` の `describe` ブロックを削除し import も除く（テストが先に更新されることで実装削除後もテストが通ることを保証）
- [x] T002 [P] `tests/unit/gameReducer.test.ts` の全 `RECORD_TURN` ディスパッチを `{ type: 'RECORD_TURN', pinsKnockedDown: X, pinNumber: Y }` から `{ type: 'RECORD_TURN', points: P }` に更新する（得点値を直接指定: 例 `pinsKnockedDown:1, pinNumber:12` → `points:12`、`pinsKnockedDown:3` → `points:3`、`pinsKnockedDown:0` → `points:0`）。`RECORD_MOLKKOUT_TURN` ディスパッチが存在する場合も同様に `{ type: 'RECORD_MOLKKOUT_TURN', points: P }` に更新する（T001/T002 は互いに並列可だが、T003 の前提条件）
- [x] T003 `src/types/game.ts` の `Turn` インターフェースから `pinsKnockedDown` と `pinNumber` を削除し、`MolkkoutTurn` からも同フィールドを削除し、`GameAction` の `RECORD_TURN` を `{ type: 'RECORD_TURN'; points: number }` に・`RECORD_MOLKKOUT_TURN` を `{ type: 'RECORD_MOLKKOUT_TURN'; points: number }` に変更する
- [x] T004 `src/utils/scoring.ts` から `calculatePoints` 関数を削除する（`applyBustRule`・`checkWin`・`incrementMisses` は変更なし）
- [x] T005 `src/reducers/gameReducer.ts` の `RECORD_TURN` ケースを更新する: `calculatePoints` import と呼び出しを削除し `const points = action.points` を使用・`isMiss` を `points === 0` で判定・`turn` オブジェクトから `pinsKnockedDown`・`pinNumber` を削除。同様に `RECORD_MOLKKOUT_TURN` ケースも更新する。
- [x] T006 [P] `src/utils/storage.ts` の `STORAGE_KEY` を `'molkky-score-v1'` から `'molkky-score-v2'` に、`SCHEMA_VERSION` を `1` から `2` に変更する

**Checkpoint**: `npm run test:run` が全テストパスすること

---

## Phase 3: User Story 1 - 通常ゲームでの得点直接入力 (Priority: P1) 🎯

**Goal**: 通常ゲームのスコア入力を1タップで完了できる

**Independent Test**: ゲーム画面を開き 0〜12 のボタンを1タップするとスコアが更新され次のプレイヤーに移る

- [x] T007 [US1] `src/components/GameScreen/PinInput.tsx` を1タップ UI に全面変更する: Props を `{ onSubmit: (points: number) => void }` に変更・0 を全幅赤ボタン（`bg-red-500 text-white w-full py-4 rounded-2xl`）・1〜12 を `grid grid-cols-4 gap-2` の3行グリッド（`bg-green-500 text-white`・各ボタン `py-4 min-h-[44px]` で均一サイズ）・タップ即 `onSubmit(value)` 呼び出し・2ステップ State 削除
- [x] T008 [US1] `src/components/GameScreen/index.tsx` の `handlePinSubmit` シグネチャを `(points: number)` に変更し・`calculatePoints` 呼び出しを削除し・`isMiss` を `points === 0` で判定し・バースト通知を `applyBustRule(player.score, points)` で判定し（`calculatePoints` 呼び出しを削除して `points` を直接渡す）・dispatch を `{ type: 'RECORD_TURN', points }` に更新する

**Checkpoint**: ゲーム画面で1タップ入力が動作し、バースト・脱落・勝利・アンドゥが正常に機能すること

---

## Phase 4: User Story 2 - Mölkkout モードでの得点直接入力 (Priority: P2)

**Goal**: Mölkkout のスコア入力も1タップで完了できる

**Independent Test**: Mölkkout 画面で 0〜12 のボタンを1タップするとチームスコアが更新され次の投球者に移る

- [x] T009 [P] [US2] `src/components/MolkkoutScreen/MolkkoutInput.tsx` を1タップ UI に全面変更する: Props を `{ onSubmit: (points: number) => void }` に変更・PinInput.tsx と同じレイアウト（0 全幅赤・1〜12 グリッド緑）・タップ即 `onSubmit(value)` 呼び出し・2ステップ State 削除
- [x] T010 [US2] `src/components/MolkkoutScreen/index.tsx` の `handleSubmit` シグネチャを `(points: number)` に変更し・dispatch を `{ type: 'RECORD_MOLKKOUT_TURN', points }` に更新する

**Checkpoint**: Mölkkout 画面で1タップ入力が動作し、チームスコアが正しく更新されること

---

## Final Phase: Polish & 品質確認

- [x] T011 [P] TypeScript strict mode チェックを実行する（`npx tsc --noEmit` でエラー0件）
- [x] T012 [P] 全テストを実行する（`npm run test:run` でエラー0件）
- [x] T013 [P] `specs/002-direct-score-input/quickstart.md` のシナリオ 1〜7 を手動確認する（特にシナリオ 6: 旧 localStorage データがクリアされること・ボタンサイズが均一で44×44px 以上であること）

---

## Dependency Graph

```
Phase 2 (Foundational)
  T001 (scoring tests) ─┐
  T002 (reducer tests) ─┤→ T003 (types) → T004 (scoring.ts)
  T006 (storage)        │              → T005 (reducer)
                        └──────────────────────────────────┐
                                                           ↓
Phase 3 (US1)                                 T003 完了後に開始可
  T007 (PinInput) → T008 (GameScreen index)

Phase 4 (US2)                                 T003 完了後に開始可（US1 と並列）
  T009 (MolkkoutInput) → T010 (MolkkoutScreen index)

Final Phase
  T011・T012・T013 (全実装完了後)
```

**Note**: US1（T007-T008）と US2（T009-T010）は Phase 2 完了後に並列実行可能。

---

## Implementation Strategy

### MVP（US1 のみ）

Phase 2（T001〜T006）+ Phase 3（T007〜T008）= 通常ゲームが1タップ入力で完了する最小版

### フル実装

MVP + Phase 4（T009〜T010）= Mölkkout も1タップ入力

---

## Parallel Execution Examples

### Phase 2 内の並列

```
[Parallel start]
T001 (scoring.test.ts) ─┐
T002 (gameReducer.test.ts) ─┤→ T003 (types) → T004, T005 (sequential)
T006 (storage.ts) ──────────┘
```

### Phase 3 + Phase 4 の並列（Phase 2 完了後）

```
[Parallel after Phase 2]
T007 → T008  (US1: GameScreen)
T009 → T010  (US2: MolkkoutScreen)
```

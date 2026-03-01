# Tasks: 次のゲーム設定画面（リマッチ）

**Input**: Design documents from `/specs/009-rematch-setup/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Tests**: スコア計算・ゲームルール変更なし（ナビゲーション変更＋i18n修正のみ）のため新規テスト不要。既存ユニットテスト（27件）のパス確認のみ。

**Organization**: US1 単一ストーリー。セットアップ・基盤フェーズは不要。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup

> 既存プロジェクト・新規依存関係なし。セットアップタスクは不要。

---

## Phase 2: User Story 1 - 前回のプレイヤーを引き継いで次のゲームを準備する (Priority: P1) 🎯 MVP

**Goal**: 結果画面の「もう一度」ボタンを押すと、前回プレイヤー一覧が初期値として設定済みの
セットアップ画面に遷移する。`REMATCH_SETUP` アクションを追加し、`SetupScreen` で
`rematchPlayers` を初期値として読み込む。

**Independent Test**: ゲームを完了して結果画面で「もう一度」ボタンを押したとき、
前回のプレイヤー全員が設定済み状態のセットアップ画面が開くことを目視確認する。
変更なしで「ゲーム開始」を押すと前回と同じプレイヤー構成でゲームが始まることを確認する。

### Implementation for User Story 1

- [x] T001 [US1] Add `rematchPlayers: string[] | null` field to `GameState` interface and `{ type: 'REMATCH_SETUP' }` to `GameAction` union type in `src/types/game.ts`
- [x] T002 [P] [US1] Add `rematchPlayers: null` to `initialState`, add `REMATCH_SETUP` case (extracts player names → sets `rematchPlayers` + navigates to `'setup'`), and clear `rematchPlayers: null` in `START_GAME` case in `src/reducers/gameReducer.ts`
- [x] T003 [P] [US1] Change `useState<string[]>([])` to `useState<string[]>(state.rematchPlayers ?? [])` for players initial state in `src/components/SetupScreen.tsx`
- [x] T004 [P] [US1] Change `dispatch({ type: 'RESTART_GAME' })` to `dispatch({ type: 'REMATCH_SETUP' })` on the「もう一度」button in `src/components/ResultScreen.tsx`
- [x] T005 [P] [US1] Fix `errorMaxPlayers` string from "最大6人まで登録できます" to "最大10人まで登録できます" in `src/i18n/ja.ts`, and from "Maximum 6 players allowed" to "Maximum 10 players allowed" in `src/i18n/en.ts` (FR-005)

**Checkpoint**: 「もう一度」ボタンで前回プレイヤー引き継ぎセットアップ画面が開くことを目視確認。「新しいゲーム」ボタンは空のセットアップ画面が開くことを確認。

---

## Phase 3: Polish & Verification

**Purpose**: 既存ユニットテストの継続パス確認（SC-005）と TypeScript コンパイルエラーなし確認

- [x] T006 Run `npm test` to verify all 27 existing tests still pass (SC-005)
- [x] T007 [P] Run `npx tsc --noEmit` to confirm TypeScript compiles without errors

---

## Dependencies & Execution Order

- **T001**: 即時開始可能（型定義の変更を先行して行う）
- **T002 / T003 / T004 / T005**: T001 完了後に並行実施可能（異なるファイルのため依存なし）
- **T006 / T007**: T001〜T005 完了後に実施（並行可能）

---

## Parallel Execution

```bash
# T002・T003・T004・T005 は T001 完了後に並行実行可能
Task T002: src/reducers/gameReducer.ts の更新
Task T003: src/components/SetupScreen.tsx の更新
Task T004: src/components/ResultScreen.tsx の更新
Task T005: src/i18n/ja.ts + src/i18n/en.ts の errorMaxPlayers 修正

# T006・T007 は T001〜T005 完了後に並行実行可能
Task T006: npm test
Task T007: npx tsc --noEmit
```

---

## Implementation Strategy

### MVP (US1)

1. T001: 型定義を先行更新（他ファイルがコンパイル依存）
2. T002 + T003 + T004 + T005: 並行実施（異なるファイル）
3. **STOP and VALIDATE**: 「もう一度」挙動の目視確認
4. T006 + T007: テスト・型チェック

---

## Notes

- T001 が型定義を変更するため、T002〜T004 は T001 完了後に開始すること（TypeScript コンパイルエラー回避）
- T002〜T004 はそれぞれ異なるファイルのため、T001 完了後は並行実施可能
- `RESTART_GAME` アクションは削除しない（既存ユニットテスト `tests/unit/gameReducer.test.ts:208` が参照）
- `rematchPlayers` は `StoredState` に含まれないため自動的に非永続化（ブラウザリロードで消える）
- 新規テスト不要（Constitution II 準拠：ナビゲーション変更のみ）

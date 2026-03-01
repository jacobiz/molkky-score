# Tasks: 得点入力エリア拡大・プレイヤー上限10人対応

**Input**: Design documents from `/specs/007-layout-max-players/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Tests**: 本機能は CSS クラス変更と UI バリデーション値変更のみのため新規テスト不要。
既存ユニットテスト（27件）のパス確認のみ行う（SC-006）。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup

> 既存プロジェクト・新規依存関係なし。セットアップタスクは不要。

---

## Phase 2: User Story 1+2 - ゲーム画面レイアウト変更 (Priority: P1+P2) 🎯 MVP

**Goal**: ScoreBoard エリアを固定高さ（`flex-none` + `h-[272px]`）、PinInput エリアを
残余スペース充填（`flex-1 min-h-0`）に変更し、ボタンを縦方向に拡大する。
4人以下スクロールなし・5人以上スクロール許容を同時に実現。

**Independent Test**: ゲームを2〜4人で開始し、ScoreBoard と PinInput が同時に1画面に
収まり PinInput ボタンが以前より縦に大きく表示されることを目視確認する。5人以上では
ScoreBoard 内スクロールが可能なことを確認する。デスクトップ（md: 幅以上）でも
レイアウトが正常に表示されることを確認する。

### Implementation for User Story 1+2

- [ ] T001 [US1] [US2] Update flex roles in `src/components/GameScreen/index.tsx`: ScoreBoard area `flex-1 min-h-0` → `flex-none`; ScoreBoard wrapper `flex-1 min-h-0 overflow-y-auto` → `h-[272px] overflow-y-auto md:h-auto md:flex-1 md:min-h-0`; PinInput area `shrink-0` → `flex-1 min-h-0`
- [ ] T002 [P] [US1] Update `src/components/GameScreen/PinInput.tsx`: outer div add `h-full` to class (`flex flex-col gap-2 p-3` → `flex flex-col gap-2 p-3 h-full`); grid div add `flex-1 min-h-0` (`grid grid-cols-4 grid-rows-3 gap-2` → `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2`); remove `py-2` from grid button className

**Checkpoint**: 2〜4人ではスクロールなし・ボタン拡大を確認。5人以上では ScoreBoard 内
スクロール・PinInput は常に画面内確認。デスクトップ横並びレイアウト確認。

---

## Phase 3: User Story 3 - プレイヤー上限10人対応 (Priority: P3)

**Goal**: プレイヤー登録上限を6人から10人に引き上げる。

**Independent Test**: プレイヤー設定画面で10人まで追加でき、11人目の追加ボタンが
無効になることを確認する。10人でゲームを開始してスコア入力・undo が正常に動作する
ことを確認する。

### Implementation for User Story 3

- [ ] T003 [P] [US3] Change `players.length >= 6` to `players.length >= 10` in `src/components/SetupScreen.tsx` (handleAddPlayer function, ~line 14)

**Checkpoint**: 10人まで登録可能・11人目は追加不可・10人ゲームでスコア入力正常動作確認。

---

## Phase 4: Polish & Verification

**Purpose**: 既存ユニットテストの継続パス確認（SC-006）と TypeScript コンパイルエラーなし確認

- [ ] T004 Run `npm test` to verify all 27 existing tests still pass (SC-006; also confirms FR-006: game logic supports 10 players without reducer changes)
- [ ] T005 [P] Run `npx tsc --noEmit` to confirm TypeScript compiles without errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (US1+US2)**: 即時開始可能。T001 と T002 は異なるファイルのため並行実行可能
- **Phase 3 (US3)**: Phase 2 とは完全独立。同時並行で実施可能
- **Phase 4 (Polish)**: Phase 2 と Phase 3 の両方が完了後に実施

### User Story Dependencies

- **US1+US2 (T001, T002)**: 互いに並行可能（index.tsx / PinInput.tsx）
- **US3 (T003)**: US1+US2 とは完全独立（SetupScreen.tsx のみ）

---

## Parallel Execution

```bash
# T001 と T002 は並行実行可能（異なるファイル）
Task T001: src/components/GameScreen/index.tsx のフレックス役割変更
Task T002: src/components/GameScreen/PinInput.tsx の高さ充填変更

# T003 は T001/T002 と並行実行可能（完全独立ファイル）
Task T003: src/components/SetupScreen.tsx プレイヤー上限変更

# 全実装完了後
Task T004: npm test
Task T005: npx tsc --noEmit（T004 と並行可能）
```

---

## Implementation Strategy

### MVP First (US1+US2)

1. T001: index.tsx フレックス役割逆転
2. T002: PinInput.tsx 高さ充填（T001 と並行）
3. **STOP and VALIDATE**: 2〜4人でボタン拡大・スクロールなし確認。5人以上でスクロール確認

### Full Implementation

1. MVP (T001 + T002) → 動作確認
2. T003: プレイヤー上限変更 → 動作確認
3. T004 + T005: テスト・型チェック確認

---

## Notes

- `h-[272px]` = 4行 × 68px（py-2 16px + [text-2xl 32px + text-sm 20px] = 68px）
- T001 と T002 は同時編集可能（異なるファイル: index.tsx / PinInput.tsx）
- T003 は1行変更のみ（`>= 6` → `>= 10`）
- 新規テスト不要（CSS クラス変更・UI バリデーション値変更のみ、Constitution II 準拠）
- md: ブレークポイント以上のデスクトップレイアウトは `md:flex-1 md:min-h-0` / `md:h-auto` で完全維持

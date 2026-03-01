# Tasks: 横画面レイアウト最適化（タブレット対応）

**Input**: Design documents from `/specs/008-landscape-layout/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Tests**: CSS クラス変更のみのため新規テスト不要。既存ユニットテスト（27件）のパス確認のみ。

**Organization**: US1 単一ストーリー。セットアップ・基盤フェーズは不要。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup

> 既存プロジェクト・新規依存関係なし。セットアップタスクは不要。

---

## Phase 2: User Story 1 - 横画面でポイント入力エリアを広く使えるようにする (Priority: P1) 🎯 MVP

**Goal**: 横画面（md: 幅以上）でポイント入力エリアの幅を固定 320px から画面幅の 40%
に拡大する。1024px 端末で +28%・1280px 端末で +60% の幅増加を実現。

**Independent Test**: ブラウザを横画面幅（1024px 以上）に設定してゲームを開始し、
ポイント入力エリアが以前より広く表示されることを目視確認する。最大幅が画面の 50% を
超えないことを確認する。縦画面幅（768px 未満）ではレイアウトが変わらないことを確認する。

### Implementation for User Story 1

- [x] T001 [US1] Change `md:w-80` to `md:w-2/5` in PinInput wrapper div in `src/components/GameScreen/index.tsx` (line 73)

**Checkpoint**: 横画面でポイント入力エリアが以前より広く・縦画面は変化なしを目視確認。

---

## Phase 3: Polish & Verification

**Purpose**: 既存ユニットテストの継続パス確認（SC-005）と TypeScript コンパイルエラーなし確認

- [x] T002 Run `npm test` to verify all 27 existing tests still pass (SC-005)
- [x] T003 [P] Run `npx tsc --noEmit` to confirm TypeScript compiles without errors

---

## Dependencies & Execution Order

- **T001**: 即時開始可能
- **T002 / T003**: T001 完了後に実施（並行可能）

---

## Parallel Execution

```bash
# T002 と T003 は並行実行可能
Task T002: npm test
Task T003: npx tsc --noEmit
```

---

## Implementation Strategy

### MVP (US1)

1. T001: `md:w-80` → `md:w-2/5` に変更（1クラス・1行）
2. **STOP and VALIDATE**: 横画面・縦画面の目視確認
3. T002 + T003: テスト・型チェック

---

## Notes

- `md:w-2/5` = 40% of screen width（常に 50% 上限を満たす）
- 変更は index.tsx の 1 行のみ（`md:w-80` → `md:w-2/5`）
- 新規テスト不要（CSS クラス変更のみ、Constitution II 準拠）

---

description: "Task list for 006-fix-scoreboard-layout"
---

# Tasks: Fix Scoreboard Layout for 5-6 Players

**Input**: Design documents from `/specs/006-fix-scoreboard-layout/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅ (N/A)

**Tests**: No new tests required — changes are pure Tailwind class adjustments. Existing 27 unit tests (game logic) must continue to pass (SC-004).

**Organization**: Tasks grouped by user story. US1 (P1) fixes the layout scroll bug; US2 (P2) enlarges button text.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Path Conventions

Single-project layout — `src/` at repository root.

---

## Phase 1: Setup

*Not applicable — no project initialization or dependency changes required for this pure layout fix.*

---

## Phase 2: Foundational

*Not applicable — changes are isolated to 3 existing component files with no shared infrastructure prerequisites.*

---

## Phase 3: User Story 1 — 全プレイヤーを常に一覧表示する (Priority: P1) 🎯 MVP

**Goal**: Fix the mobile portrait flex layout so that 5-6 player games display all player rows and the score-input area simultaneously without any inner scrollbar.

**Independent Test**: Start a 6-player game, open the game screen on a mobile viewport (≥600px) — all 6 player rows are visible, no scrollbar appears inside the player list, and the score-input buttons are visible on the same screen without scrolling (SC-001, SC-002).

### Implementation for User Story 1

- [x] T001 [P] [US1] Fix flex roles in `src/components/GameScreen/index.tsx`: change top section from `shrink-0 flex flex-col` → `flex-1 min-h-0 flex flex-col`; change header from `py-4` → `py-3`; change scoreboard wrapper from `overflow-y-auto max-h-80 md:max-h-none md:flex-1` → `flex-1 min-h-0 overflow-y-auto`; change PinInput wrapper from `flex-1 min-h-0 flex flex-col` → `shrink-0 flex flex-col`
- [x] T002 [P] [US1] Compact ScoreBoard rows in `src/components/GameScreen/ScoreBoard.tsx`: remove `overflow-y-auto` from the container div; change row padding from `py-3` → `py-2`; replace the stacked two-paragraph score area (`<p text-2xl>{score}</p>` + `<p text-sm>remaining N</p>`) with a single-line inline display (`<span text-xl font-bold>{score}</span><span text-xs ml-1 text-gray-400>/{remaining}</span>`) inside a `div.text-right.min-w-16`; preserve all existing conditional colour classes (`isCloseToWin` → orange)
- [x] T003 [P] [US1] Compact PinInput structure in `src/components/GameScreen/PinInput.tsx`: change outer div from `flex flex-col gap-3 p-4 h-full` → `flex flex-col gap-2 p-3` (remove `h-full`, reduce spacing); change button-0 from `py-4` → `py-2` (keep `shrink-0 w-full rounded-2xl bg-red-500 text-white font-bold active:bg-red-600`); change grid wrapper from `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2 max-h-[280px]` → `grid grid-cols-4 grid-rows-3 gap-2` (remove flex-1, min-h-0, max-h cap); change grid buttons from `py-4 min-h-[44px]` → `min-h-[44px] py-2` (touch target preserved)

**Checkpoint**: At this point, US1 is fully functional. Open a 6-player game on a 600px+ mobile viewport — all players visible, no inner scroll, score input area visible simultaneously.

---

## Phase 4: User Story 2 — 得点ボタンの文字を大きくする (Priority: P2)

**Goal**: Increase the font size of all score-input buttons (0–12) so numbers are clearly readable during outdoor play.

**Independent Test**: Open a game, view the score-input area — the 0–12 button labels are visibly larger than before (text-2xl vs text-xl, ~20% size increase) and all buttons remain fully tappable with no layout overflow on small screens.

### Implementation for User Story 2

- [x] T004 [US2] Increase button text in `src/components/GameScreen/PinInput.tsx`: change button-0 text from `text-xl` → `text-2xl`; change all grid buttons (1–12) text from `text-xl` → `text-2xl`; verify buttons remain within their containers at 4-column width on small screens

**Checkpoint**: All buttons (0–12) display noticeably larger numbers while remaining tappable and properly sized within the 4-column grid.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T005 Run `npm test && npm run lint` from project root and confirm all 27 existing unit tests pass and no TypeScript/lint errors are introduced
- [ ] T006 [P] Manually verify desktop (`md:` breakpoint) layout is unchanged: open at ≥768px width and confirm the side-by-side layout (ScoreBoard left, PinInput right) still renders correctly
- [ ] T007 [P] Manually verify 2–4 player mobile portrait layout: start a 2-player and 4-player game, confirm all player rows and score-input area are visible, game functions correctly (SC-003)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 3 (US1)**: No prerequisites — start immediately
- **Phase 4 (US2)**: Depends on T003 completing (same file — PinInput.tsx)
- **Phase 5 (Polish)**: Depends on all implementation tasks completing

### User Story Dependencies

- **US1 (P1)**: No dependencies — start immediately
- **US2 (P2)**: T004 touches the same file as T003 — execute T004 after T003 is merged/stable

### Within User Story 1

- T001 (index.tsx), T002 (ScoreBoard.tsx), T003 (PinInput.tsx) touch **different files** — can be worked in parallel [P] where marked
- T001 is the structural fix; T002 and T003 are independent compact changes

### Parallel Opportunities

- T002 and T003 can be done in parallel (different files)
- T001 can proceed alongside T002 and T003 (different file)
- T005 and T006 can run in parallel (different verification targets)

---

## Parallel Example: User Story 1

```bash
# T001, T002, T003 all touch different files — can run simultaneously:
Task A: "Fix flex roles in src/components/GameScreen/index.tsx"       (T001)
Task B: "Compact ScoreBoard rows in src/components/GameScreen/ScoreBoard.tsx"  (T002)
Task C: "Compact PinInput structure in src/components/GameScreen/PinInput.tsx" (T003)

# After all three complete:
Task D: "Increase button text in PinInput.tsx"  (T004, US2)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 + T002 + T003 in parallel
2. **STOP and VALIDATE**: Open 6-player game on mobile — all players visible, no inner scroll
3. Proceed to US2 (T004) only after US1 checkpoint passes

### Incremental Delivery

1. T001+T002+T003 → US1 complete (layout bug fixed) → **shippable**
2. T004 → US2 complete (bigger text) → **shippable**
3. T005+T006 → confirmed regression-free → **release ready**

---

## Notes

- [P] tasks = different files, no dependencies between them
- All changes are Tailwind utility class edits — no TypeScript logic, no game state changes
- `md:` breakpoint classes in index.tsx are preserved; desktop layout is unaffected
- Minimum supported viewport: 600px portrait (per spec Assumptions)
- Touch target minimum: 44px — maintained via `min-h-[44px]` on grid buttons (T003/T004)

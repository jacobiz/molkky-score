# Implementation Plan: Fix Scoreboard Layout for 5-6 Players

**Branch**: `006-fix-scoreboard-layout` | **Date**: 2026-03-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-fix-scoreboard-layout/spec.md`

## Summary

Fix the mobile portrait layout so that 5–6 player games always show all players in the scoreboard and the score-input area simultaneously — without any inner scroll. Also enlarges score-button text for better outdoor readability (US2).

Root cause: `shrink-0` on the top flex section and `max-h-80 overflow-y-auto` on the scoreboard wrapper create a hard 320px cap. With 5-6 rows at ~76px each, the scoreboard overflows and scrolls. Fix restructures the flex tree (top section `flex-1 min-h-0`, PinInput `shrink-0`) and compacts rows by reducing padding and inlining the score/remaining display. No logic or data-model changes.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 19, TailwindCSS v4 (`@tailwindcss/vite`), Vite 6.1
**Storage**: N/A
**Testing**: Vitest (existing 27 unit tests cover game logic — no new tests required for pure layout changes per Constitution Principle II)
**Target Platform**: Mobile PWA (portrait, ≥600px viewport height)
**Project Type**: Mobile-first PWA / web app
**Performance Goals**: Touch response <100ms (unchanged)
**Constraints**: All players visible + score input on one screen at 600px minimum height; no scroll inside player list (FR-001, FR-002)
**Scale/Scope**: 2–6 players, 3 component files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|-----------|-------|--------|
| **I. シンプルさ優先** — YAGNI, no new abstractions | Changes are pure Tailwind class edits in 3 existing files. No new components, hooks, or libraries. | ✅ PASS |
| **II. テストファースト（主要機能のみ）** — Tests for score calc / game rules only; UI tests optional | No game logic changes. Existing 27 tests unaffected. Layout-only change; UI tests not required. | ✅ PASS |
| **III. モバイルファースト・PWA** — Mobile-first, offline, touch-optimised | Fix specifically targets mobile portrait layout. Reduces button padding while enlarging text (better touch UX). Desktop (`md:`) layout unchanged. | ✅ PASS |
| **品質ゲート** — All main-feature tests pass; no TS errors; no unnecessary complexity | No TS changes; existing tests pass; complexity only in one `<span>` restructure inside ScoreBoard row. | ✅ PASS |

**No violations — Complexity Tracking table not required.**

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-scoreboard-layout/
├── plan.md              ← this file
├── research.md          ← Phase 0 output (root-cause analysis + decisions)
├── data-model.md        ← Phase 1 output (N/A — no model changes)
└── tasks.md             ← Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
└── components/
    └── GameScreen/
        ├── index.tsx        ← flex layout restructure (shrink-0 → flex-1, PinInput wrapper → shrink-0, scoreboard wrapper classes)
        ├── ScoreBoard.tsx   ← compact rows: py-3→py-2, inline score/remaining display
        └── PinInput.tsx     ← remove h-full, natural grid height, py-4→py-2, text-xl→text-2xl

tests/                       ← no changes (existing 27 unit tests cover logic only)
```

**Structure Decision**: Single-project option. All changes are Tailwind class adjustments in the existing `GameScreen/` component folder. No new files needed.

## Phase 1 Design

### data-model.md

No data model changes. The feature is a pure CSS/layout fix. See `data-model.md` for the minimal N/A record.

### contracts/

No new public interfaces, API endpoints, or external contracts introduced. Skipped.

### Detailed Change Specification

#### `src/components/GameScreen/index.tsx`

| Line | Before | After | Reason |
|------|--------|-------|--------|
| 45 | `shrink-0 flex flex-col` | `flex-1 min-h-0 flex flex-col` | Allow top section to grow/shrink in flex column |
| 46 | `py-4` on header | `py-3` on header | Recover 8px vertical space |
| 64 | `overflow-y-auto max-h-80 md:max-h-none md:flex-1` | `flex-1 min-h-0 overflow-y-auto` | Remove hard cap; fill available space; retain scroll safety net for very small screens |
| 73 | `flex-1 min-h-0 flex flex-col` | `shrink-0 flex flex-col` | PinInput takes natural height, stays anchored at bottom |

#### `src/components/GameScreen/ScoreBoard.tsx`

| Change | Before | After | Reason |
|--------|--------|-------|--------|
| Container | `overflow-y-auto` present | remove `overflow-y-auto` | Scroll managed by wrapper; inner scroll no longer wanted |
| Row padding | `py-3` | `py-2` | Reduce row from ~76px to ~48px |
| Score area | `<p text-2xl>score</p>` + `<p text-sm>remaining N</p>` (stacked) | `<span text-2xl>score</span><span text-xs ml-1>/N</span>` inline | Single-line → row height set by font only |

#### `src/components/GameScreen/PinInput.tsx`

| Change | Before | After | Reason |
|--------|--------|-------|--------|
| Outer div | `flex flex-col gap-3 p-4 h-full` | `flex flex-col gap-2 p-3` | Remove `h-full` (parent is now `shrink-0`); compact spacing |
| Button 0 | `py-4 text-xl` | `py-2 text-2xl` | Bigger text (US2); smaller padding keeps total height manageable |
| Grid wrapper | `flex-1 min-h-0 grid grid-cols-4 grid-rows-3 gap-2 max-h-[280px]` | `grid grid-cols-4 grid-rows-3 gap-2` | Natural height, no flex expansion needed |
| Grid buttons | `py-4 min-h-[44px] text-xl` | `min-h-[44px] py-2 text-2xl` | Bigger text (US2); touch target preserved via min-h-[44px] |

### Height Budget Verification

At 600px minimum viewport (`dvh`):

```
Header (py-3):           ~56px
ScoreBoard 6×py-2 rows:  ~264px  (44px/row = 16px py-2 padding + 28px text-xl line-height)
PinInput (natural):      ~256px  (p-3×2=24 + label=24 + gap-2×3=24 + btn-0 py-2≈44 + 3-row grid≈3×44+gaps=148)
─────────────────────────────────
Total:                   ~576px ✓  (24px headroom at 600px minimum)
```

At iPhone SE (619px dvh): 608px → 11px headroom ✓
At modern phone (812px): 212px headroom → generous spacing ✓

### Desktop Layout Preservation

The `md:flex-row` on the outer container switches to side-by-side layout. The deleted `md:max-h-none md:flex-1` classes on the scoreboard wrapper are superseded by the new flexbox structure — the desktop layout is unaffected because `md:flex-1` on the top section is already present on line 45 and the scoreboard wrapper gains `flex-1` unconditionally.

## Complexity Tracking

No constitution violations. Table omitted.

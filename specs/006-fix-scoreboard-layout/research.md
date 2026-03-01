# Research: Fix Scoreboard Layout for 5-6 Players

**Feature**: 006-fix-scoreboard-layout
**Date**: 2026-03-01

---

## Decision 1: Root Cause of Layout Bug

**Decision**: The bug is caused by `overflow-y-auto max-h-80` (320px cap) on the ScoreBoard wrapper in `GameScreen/index.tsx` line 64, combined with `shrink-0` on the parent section preventing proper flex distribution.

**Rationale**: With 5 players at ~76px/row, the scoreboard content is 380px > 320px cap → scrollbar appears. The `shrink-0` on the top section also prevents flexbox from distributing space between ScoreBoard and PinInput dynamically.

**Current structure (mobile portrait)**:
```
div.h-dvh.flex.flex-col
  div.shrink-0.flex.flex-col        ← does not shrink → forces full natural height
    header (~64px)
    div.overflow-y-auto.max-h-80    ← 320px cap causes scroll for 5-6 players
      ScoreBoard
  div.flex-1.min-h-0                ← PinInput
```

**Alternatives considered**:
- Increase `max-h` value → brittle, depends on exact row heights and viewport
- Use JavaScript to calculate heights → adds complexity violating Principle I
- Redesign as fixed-position PinInput → breaks md: layout, adds complexity

---

## Decision 2: Fix Strategy — Dynamic Flex Distribution

**Decision**: Restructure layout so ScoreBoard fills the space *between* the header and PinInput dynamically via flexbox, eliminating the hard pixel cap.

**Target structure (mobile portrait)**:
```
div.h-dvh.flex.flex-col
  div.flex-1.min-h-0.flex.flex-col  ← takes all space above PinInput
    header.shrink-0 (~56px, py-3)
    div.flex-1.min-h-0.overflow-y-auto  ← ScoreBoard: grows to fill, scrolls only if tiny screen
  div.shrink-0.flex.flex-col        ← PinInput: natural height, stays at bottom
```

**Rationale**: This creates proper CSS flex distribution. PinInput sits at its natural height at the bottom; everything above it goes to the header + scoreboard. The scoreboard only shows a scrollbar if the screen is genuinely too small for all rows (below supported 600px threshold).

**Alternatives considered**:
- CSS Grid with `fr` units — same outcome, more syntax, less portable
- Split the gap 50/50 (both flex-1) — not ideal, PinInput gets half screen even with 2 players

---

## Decision 3: PinInput Natural Height Fix

**Decision**: Remove `h-full` from PinInput's inner div and change the score grid from `flex-1 min-h-0 max-h-[280px]` to a regular grid with natural button heights. This gives PinInput a predictable natural height (~264px after padding reductions).

**Rationale**: `h-full` and `flex-1 min-h-0` inside PinInput only work when the parent wrapper has a defined height. Changing the wrapper to `shrink-0` (natural height) breaks this pattern. Using natural button heights makes PinInput self-contained and predictable.

**Padding reduction (py-4 → py-2) is necessary**:
To fit 6 players + PinInput on 600px+ screens, row heights must decrease. Combined with bigger text (US2), reducing vertical padding compensates while improving text readability:
- Current: `py-4` (32px padding) + `text-xl` (28px line-height) = 60px/button
- New: `py-2` (16px padding) + `text-2xl` (32px line-height) = 48px/button → **bigger text, slightly smaller button**

---

## Decision 4: ScoreBoard Row Compaction

**Decision**: Reduce ScoreBoard row height by (a) changing `py-3` → `py-2` and (b) displaying score and remaining on the same line inline instead of stacked.

**Rationale**: Current row height with `py-3` + stacked `text-2xl` + `text-sm` = ~76px/row. With 6 rows = 456px, which exceeds available space on small phones. Inline display reduces content height to `text-2xl` only (~32px) + `py-2` (16px) = **48px/row** — 6 rows = 288px, fitting comfortably.

**Calculations for iPhone SE dvh (~619px)**:
- Header (py-3): ~56px
- ScoreBoard (6×48px): 288px
- PinInput (p-3, py-2 buttons, text-2xl): ~264px
- Total: 56+288+264 = **608px** → fits within 619px ✓

**On modern phones (iPhone 14+, dvh ≥ 800px)**: ample space, rows have visible padding.

**Alternatives considered**:
- Remove "remaining" display entirely → harms gameplay (player needs to know distance to 50)
- Keep stacked layout, allow scroll on SE → violates FR-002 for edge case

---

## Decision 5: US2 — Increase Score Button Text Size

**Decision**: Change PinInput score buttons from `text-xl font-bold` to `text-2xl font-bold`. Combine with padding reduction from `py-4` to `py-2` so net button height decreases slightly while text becomes noticeably larger.

**Rationale**: `text-2xl` (1.5rem = 24px) vs `text-xl` (1.25rem = 20px) — 20% size increase, clearly visible. Reducing `py-4` → `py-2` offsets the taller line-height, keeping total PinInput height manageable.

**Alternatives considered**:
- `text-3xl` — too large for 4-column grid on small screens, number may truncate
- Keep `py-4` with `text-2xl` — buttons would be 64px/row × 3 = 192px grid + 0-button → PinInput ~360px, too tall for SE

---

## Decision 6: Header Height Reduction

**Decision**: Change header from `py-4` (32px total vertical) to `py-3` (24px total vertical) to recover 8px of vertical space.

**Rationale**: Small saving that contributes to fitting within 600px target. The header still has adequate tap area and visual breathing room with `py-3`.

---

## Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `GameScreen/index.tsx` | Top section: `shrink-0` → `flex-1 min-h-0` | Dynamic height distribution |
| `GameScreen/index.tsx` | ScoreBoard wrapper: remove `max-h-80 overflow-y-auto`, add `flex-1 min-h-0 overflow-y-auto` | Remove hard cap |
| `GameScreen/index.tsx` | PinInput wrapper: `flex-1 min-h-0` → `shrink-0` | Natural height at bottom |
| `GameScreen/index.tsx` | Header: `py-4` → `py-3` | Recover vertical space |
| `GameScreen/ScoreBoard.tsx` | Row padding: `py-3` → `py-2` | Compact rows for 6-player fit |
| `GameScreen/ScoreBoard.tsx` | Score area: stacked → inline (`score / remaining`) | Reduce content height |
| `GameScreen/PinInput.tsx` | Remove `h-full` from outer div | Natural height |
| `GameScreen/PinInput.tsx` | Grid: remove `flex-1 min-h-0 max-h-[280px]` | Natural grid height |
| `GameScreen/PinInput.tsx` | Buttons: `text-xl py-4` → `text-2xl py-2` | US2: bigger text + compact size |
| `GameScreen/PinInput.tsx` | Outer padding: `p-4` → `p-3` | Recover vertical space |

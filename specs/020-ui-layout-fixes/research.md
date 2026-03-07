# Research: UI Layout Fixes

**Feature**: 020-ui-layout-fixes
**Date**: 2026-03-07

## Finding 1: ScoreSheetModal button gap

**File**: `src/components/ui/ScoreSheetModal.tsx` line 79
**Current**: `<div className="flex items-center gap-1 ml-4 shrink-0">`
**Issue**: `gap-1` (4px) is too narrow between print button (icon + border) and close button (✕).

**Decision**: Change `gap-1` → `gap-3` (12px).
**Rationale**: `gap-3` provides a clear visual gap without pushing buttons off narrow screens. Apple HIG recommends minimum 44px touch targets with 8–16px separation. The print button is already `px-2 py-1` with border; 12px gap keeps both buttons within a comfortable ~88px combined tap area even on 320px screens.
**Alternatives considered**: `gap-2` (8px) — minimal improvement; `gap-4` (16px) — might crowd info area on very small screens.

---

## Finding 2: Pin input area height constraint

**File**: `src/components/GameScreen/index.tsx` line 106
**Current**: `<div className="flex-1 min-h-0 flex flex-col bg-white ... safe-bottom">`
**Issue**: `flex-1` lets the pin input panel expand to fill all remaining space, which on tall screens can push it beyond 40% of usable height.

**Decision**: Add `max-h-[calc(40dvh-env(safe-area-inset-bottom,0px))] overflow-y-auto` to the pin panel container.
**Rationale**:
- `dvh` (dynamic viewport height) is the correct unit in a PWA — it adjusts for browser chrome/toolbars.
- Subtracting `env(safe-area-inset-bottom, 0px)` excludes the bottom safe area (iPhone home indicator), consistent with clarification answer B and how `safe-bottom` is applied in `index.css`.
- `overflow-y-auto` enables internal scrolling when content (NumberInput `h-full flex flex-col`) would overflow.
- The scoreboard above is a fixed `h-[272px]` on mobile, so constraining the pin panel leaves the board always visible.
**Alternatives considered**: `h-[40dvh]` fixed height — too rigid, breaks on landscape; CSS custom property via `@layer` — unnecessary complexity for a single value.

---

## Finding 3: Remove language selector from SetupScreen

**File**: `src/components/SetupScreen.tsx` lines 4, 77–80
**Current**: `LanguageSelector` is passed as `rightContent` to `ScreenHeader`.
**Issue**: Language selection is not relevant during player name entry and adds clutter.

**Decision**: Remove the `import { LanguageSelector }` statement and remove the `rightContent` prop from `<ScreenHeader>` in `SetupScreen.tsx`.
**Rationale**: Minimal change — no logic affected. `ScreenHeader` renders nothing when `rightContent` is absent/undefined. The language state remains in `GameContext` and persists unchanged.
**Alternatives considered**: Keep selector but hide it — unnecessary dead code; move selector to HomeScreen — out of scope.

---

## Finding 4: Scoresheet 50-point cumulative total cell highlight

**File**: `src/components/ui/ScoreSheetModal.tsx` lines 146–168
**Current cell data**: `entry.scoreAfter` = cumulative total after this throw.
**Win condition**: `entry.scoreAfter === 50` (exactly 50, since bust resets to 25 — `isBust` flag is set and `scoreAfter` becomes 25 on overshoot).

**Decision**: Add `entry.scoreAfter === 50 ? 'bg-green-100 text-green-800' : ''` to the className array of the `<td>`. Additionally, apply `text-green-700` to the `scoreAfter` `<span>` when winning.
**Rationale**:
- `bg-green-100` is a soft success highlight, clearly distinct from the existing `bg-red-50` (bust) and `bg-orange-50` (eliminated) states.
- The condition `scoreAfter === 50` is unambiguous: no bust can produce `scoreAfter === 50` (busts always produce `scoreAfter === 25`), so no guard against `isBust` is needed.
- No data model changes — all necessary information is already in `entry.scoreAfter`.
**Alternatives considered**: `bg-emerald-100` — functionally identical; `bg-yellow-100` — could be confused with timeout/warning; `font-bold` alone — insufficient contrast, doesn't meet SC-004 3-second recognizability target.

# Tasks: Finnish Language Support with Flag Icons

**Input**: Design documents from `/specs/010-add-finnish-lang/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: No test tasks generated — this feature touches UI components and translation files, not core game rules (Constitution §II: tests are optional for non-core logic).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies between them)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Extend the `Language` type to include `'fi'`. This single change unblocks all user stories — TypeScript will not compile `'fi'` anywhere until this is done.

**⚠️ CRITICAL**: No user story work can begin until this task is complete.

- [x] T001 Extend `Language` type from `'ja' | 'en'` to `'ja' | 'en' | 'fi'` in `src/types/game.ts`

**Checkpoint**: After T001, TypeScript accepts `'fi'` as a valid `Language` value everywhere (types, action dispatch, storage).

---

## Phase 3: User Story 1 — Browse and Play in Finnish (Priority: P1) 🎯 MVP

**Goal**: Finnish-speaking users can switch to Finnish and see all UI text in their language across every screen.

**Independent Test**: Select Finnish → navigate to Setup screen → start a game → verify every label, button, and message is in Finnish with zero English or Japanese strings visible.

### Implementation for User Story 1

- [x] T002 [US1] Create `src/i18n/fi.ts` with complete Finnish translations implementing the `Messages` type (all keys per data-model.md)
- [x] T003 [US1] Update `useTranslation()` in `src/utils/i18n.ts` to resolve `'fi'` to the `fi` locale (import `fi` from `../i18n/fi` and add it to the language switch); NOTE: FR-005 (missing key fallback) is enforced at compile time by the `Messages` type — no runtime fallback code is needed

**Checkpoint**: At this point, if `state.settings.language` is manually set to `'fi'` (e.g., via the flag selector once T004/T005 are complete, or by temporarily hardcoding `'fi'` in `gameReducer.ts` initialState for isolated testing), all screens render in Finnish. User Story 1 is independently testable.

---

## Phase 4: User Story 2 — Select Language Using Flag Icons (Priority: P2)

**Goal**: The language selector on Home and Setup screens displays three flag+code buttons (🇯🇵 JA, 🇬🇧 EN, 🇫🇮 FI). Tapping a button immediately switches language; the active language is visually highlighted.

**Independent Test**: Open Home screen → confirm three buttons are visible (🇯🇵 JA, 🇬🇧 EN, 🇫🇮 FI) → tap each → verify language switches immediately and active button is highlighted → open Setup screen → confirm same selector is present.

### Implementation for User Story 2

- [x] T004 [P] [US2] Replace the binary language toggle with a 3-button flag selector (🇯🇵 JA / 🇬🇧 EN / 🇫🇮 FI) in `src/components/HomeScreen.tsx`; active language button has filled/colored style, others outlined
- [x] T005 [P] [US2] Replace the binary language toggle with a 3-button flag selector (🇯🇵 JA / 🇬🇧 EN / 🇫🇮 FI) in `src/components/SetupScreen.tsx`; active language button has filled/colored style, others outlined

> **Note**: T004 and T005 are fully parallel (different files). Both dispatch `{ type: 'SET_LANGUAGE', language: 'fi' | 'en' | 'ja' }` — no shared state changes needed.

**Checkpoint**: Language selector works on both Home and Setup screens. All three languages selectable via flag buttons. Layout does not overflow at 320px width.

---

## Phase 5: User Story 3 — Language Persists Across Sessions (Priority: P3)

**Goal**: On first launch with no stored preference, the app auto-detects the browser locale (`fi` → Finnish, `en` → English, others → Japanese). After any manual selection, it persists across sessions via existing localStorage.

**Independent Test**: Clear localStorage → set browser language to Finnish → reload → confirm app opens in Finnish. Then select English → close tab → reopen → confirm English is still active.

### Implementation for User Story 3

- [x] T006 [US3] Add `detectLocale(): Language` function to `src/utils/i18n.ts` — reads `navigator.language?.slice(0, 2).toLowerCase()`, maps `'fi'` → `'fi'`, `'en'` → `'en'`, else `'ja'`
- [x] T007 [US3] Update the `useReducer` lazy initializer in `src/context/GameContext.tsx` to call `detectLocale()` when `loadState()` returns `null` (first launch): `return { ...init, settings: { language: detectLocale() } }`

**Checkpoint**: All three user stories complete. Finnish detection, display, selection, and persistence all work end-to-end.

---

## Phase 6: Polish & Verification

**Purpose**: Confirm no regressions in existing Japanese/English support and validate the full feature.

- [x] T008 [P] Run `npm test && npm run lint` and fix any type or lint errors
- [ ] T009 [P] Manual testing per `specs/010-add-finnish-lang/quickstart.md`: locale detection (clear storage + set browser lang to `fi`), flag selector on both screens, session persistence, full Finnish game flow; verify on iOS Safari AND Android Chrome (Constitution quality gate); verify offline mode (DevTools → Network: Offline) — locale detection and language switching work without network


---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2 — T001)**: No dependencies — start immediately
- **US1 (Phase 3 — T002, T003)**: T002 can start immediately (just creating a file); T003 depends on T001 + T002
- **US2 (Phase 4 — T004, T005)**: Depend on T001 (Language type must include `'fi'`); can start in parallel with T002
- **US3 (Phase 5 — T006, T007)**: T006 can start after T001; T007 depends on T006
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: T001 → T002 → T003 (sequential within story)
- **US2 (P2)**: T001 → T004, T005 (parallel with each other; can overlap with US1)
- **US3 (P3)**: T001 → T006 → T007 (sequential within story; can overlap with US1/US2)

### Parallel Opportunities

- **T002 and T004/T005**: All only require T001 as prerequisite — can be worked in parallel by different agents
- **T004 and T005**: Completely parallel (different files, no shared state)
- **T008 and T009**: Completely parallel (test run vs. manual testing)

---

## Parallel Execution Example: US2 (Flag Selector)

```bash
# After T001 completes, launch in parallel:
Task A: T004 — Update HomeScreen.tsx flag selector
Task B: T005 — Update SetupScreen.tsx flag selector
# Both complete independently, then merge
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (Language type extension) — Foundational
2. Complete T002 (Create `fi.ts`)
3. Complete T003 (Update `useTranslation()` hook)
4. **STOP and VALIDATE**: Manually set language to `'fi'` and verify Finnish text renders across all screens
5. Ship if sufficient — Finnish works, flag UI and locale detection are additive

### Incremental Delivery

1. **T001** → Foundation ready
2. **T002 + T003** → Finnish language available (US1 complete) ✅
3. **T004 + T005** → Flag selector live on both screens (US2 complete) ✅
4. **T006 + T007** → Auto-detection on first launch (US3 complete) ✅
5. **T008 + T009** → Verified, no regressions ✅

---

## Notes

- [P] tasks = different files, no dependencies between them
- `fi.ts` must satisfy the `Messages` TypeScript type — the compiler enforces completeness
- No new npm dependencies; no schema version bump needed
- Existing Japanese and English paths are unchanged — only `useTranslation()` gains one additional branch
- The `handleToggleLanguage` function in both screens is replaced entirely by individual per-language dispatch calls

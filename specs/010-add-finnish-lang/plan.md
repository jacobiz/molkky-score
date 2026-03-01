# Implementation Plan: Finnish Language Support with Flag Icons

**Branch**: `010-add-finnish-lang` | **Date**: 2026-03-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-add-finnish-lang/spec.md`

## Summary

Add Finnish (`fi`) as a third supported language alongside Japanese and English, with a locale-detecting first-launch default and a redesigned three-option flag+code language selector on Home and Setup screens. No new libraries are required — the feature extends the existing i18n pattern (locale files + `useTranslation` hook) with minimal, focused changes.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict mode)
**Primary Dependencies**: React 19, TailwindCSS v4 (`@tailwindcss/vite`), Vite 6.1, vite-plugin-pwa 0.21
**Storage**: localStorage — key `molkky-score-v2`, `SCHEMA_VERSION=2` (unchanged)
**Testing**: Vitest (existing test suite)
**Target Platform**: Mobile-first PWA (iOS/Android browser), offline-capable
**Project Type**: Web application (PWA)
**Performance Goals**: Language switch within one render cycle (<100ms per Constitution §III)
**Constraints**: Offline-capable (no network calls); no new npm dependencies (Constitution §I)
**Scale/Scope**: 3 supported languages, 8 translation keys groups, 2 screens affected (Home, Setup)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. シンプルさ優先** | ✅ Pass | No new libraries. Extends existing locale file pattern. No abstraction beyond what's needed. |
| **II. テストファースト** | ✅ Pass | This feature touches UI components and translation files, not core game rules. Tests are optional per §II. The `detectLocale()` utility is simple enough to skip TDD. |
| **III. モバイルファースト・PWA** | ✅ Pass | Flag selector designed for touch targets. No network calls. Locale detection uses `navigator.language` (available offline). |
| **品質ゲート** | ✅ Pass | TypeScript strict mode maintained. Existing tests must continue to pass. Mobile testing required before merge. |

**No complexity violations. Complexity Tracking table not required.**

## Project Structure

### Documentation (this feature)

```text
specs/010-add-finnish-lang/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code Changes

```text
src/
├── i18n/
│   ├── en.ts            # unchanged
│   ├── fi.ts            # NEW — Finnish translations (same shape as Messages)
│   └── ja.ts            # unchanged
├── types/
│   └── game.ts          # MODIFY — Language: 'ja' | 'en' → 'ja' | 'en' | 'fi'
├── utils/
│   └── i18n.ts          # MODIFY — add fi locale, add detectLocale() function
├── reducers/
│   └── gameReducer.ts   # unchanged (initialState stays 'ja'; locale detection in context)
├── context/
│   └── GameContext.tsx  # MODIFY — call detectLocale() in lazy initializer (first launch only)
└── components/
    ├── HomeScreen.tsx    # MODIFY — replace toggle button with 3-option flag selector
    └── SetupScreen.tsx   # MODIFY — replace toggle button with 3-option flag selector
```

**Structure Decision**: Single project (existing). No new directories beyond `src/i18n/fi.ts`.

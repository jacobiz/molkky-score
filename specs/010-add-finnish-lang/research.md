# Research: Finnish Language Support with Flag Icons

**Feature**: 010-add-finnish-lang | **Date**: 2026-03-01

## Decision 1: i18n Architecture — New Library vs. Extend Existing Pattern

**Decision**: Extend the existing locale-file pattern (`src/i18n/*.ts` + `useTranslation` hook). No new library.

**Rationale**: The app already has a clean, working i18n pattern: typed locale objects (`Messages` type from `ja.ts`) and a `useTranslation()` hook that selects the active locale. Adding Finnish is a pure extension — one new file (`fi.ts`) and a union type change. Introducing a library (e.g., `i18next`, `react-intl`) would add dependency weight, configuration complexity, and violate Constitution §I (YAGNI / minimal dependencies).

**Alternatives considered**:
- `i18next` / `react-i18next` — rejected: overkill for 3 static locales; adds ~30KB bundle weight
- `@formatjs/intl` — rejected: same reasoning; pluralization features not needed for this app
- External JSON files — rejected: TypeScript object files give compile-time key checking for free

---

## Decision 2: Locale Detection on First Launch

**Decision**: Use `navigator.language` (read the first 2 chars) in `GameContext.tsx`'s lazy initializer. Map `fi` → `'fi'`, `en` → `'en'`, all others → `'ja'`.

**Rationale**: `navigator.language` is synchronous, available offline, and requires no network call. The lazy initializer in `useReducer` is the correct place for this — it runs once at mount, only when `loadState()` returns `null` (first launch). This keeps `gameReducer.ts` and `initialState` unchanged, and avoids polluting the reducer with platform-specific logic.

**Implementation**:
```ts
// src/utils/i18n.ts
export function detectLocale(): Language {
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  if (lang === 'fi') return 'fi'
  if (lang === 'en') return 'en'
  return 'ja'
}
```

**Edge cases handled**:
- `navigator.language` undefined (old browsers): falls back to `'ja'` via optional chaining
- Locale `fi-FI`, `en-US`, `en-GB`: `.slice(0, 2)` handles all regional variants
- Shared devices: once user manually picks a language, it's saved to localStorage and locale detection never runs again

**Alternatives considered**:
- `Intl.Locale` API — more correct but overkill; `.slice(0, 2)` is sufficient for 3 locales
- Accepting app default `'ja'` always — rejected per user decision (Clarification Q1: Option B)

---

## Decision 3: Language Selector UI — Toggle → Three-Button Group

**Decision**: Replace the single toggle button with a horizontal group of three buttons, each showing `{flag} {code}` (e.g., `🇫🇮 FI`). The active language button is visually distinguished (filled/colored background, others outlined).

**Rationale**: The current toggle works for 2 options but breaks semantically with 3 (cycling would be confusing). A button group makes all options visible simultaneously, matches the clarified spec (Option B: flag + short code), and fits within 320px with three compact buttons (approx. 88px each at minimum).

**Layout spec**:
- Container: `flex gap-1` or `flex gap-2` centered
- Each button: `px-3 py-1.5 rounded-full text-sm font-medium`
- Active: `bg-blue-500 text-white`
- Inactive: `border border-gray-300 text-gray-600 bg-white`
- Content: `🇯🇵 JA` / `🇬🇧 EN` / `🇫🇮 FI`

**Width calculation**: 3 buttons × ~80px = ~240px + gaps — comfortably fits 320px minimum width.

**Alternatives considered**:
- Dropdown/`<select>` — accessible but visually inconsistent with app's button-first style
- Cycling toggle (3-state) — confusing UX; user cannot see all options at once
- Full language name (`Suomi`, `English`, `日本語`) — wider, rejected per user decision (Clarification Q2: Option B)

---

## Decision 4: Finnish Translation Authorship

**Decision**: Author Finnish translations directly in the plan, derived from standard Finnish Mölkky terminology.

**Rationale**: The app has 8 translation key groups with ~45 strings. Finnish is the native language of Mölkky, and standard game terminology is well-established. No external translation service is needed (Constitution §I: minimize dependencies; spec Assumption: translations authored in-feature).

**Key terminology decisions**:
- "Vuoro" = turn (standard Finnish)
- "Pisteet" = score/points
- "Hutti" (pl. "hutit") = miss
- "Keilattu ulos" → simplified to "Poistettu" (eliminated) for consistency with other locales' concise labels
- "Mölkkout ratkaisuheitto" → "Mölkkout (ratkaisuheitto)" matching Japanese parenthetical style
- Ordinal suffix: Finnish uses `1.`, `2.`, `3.` (number + period); `rankSuffix` returns `"."`

---

## Decision 5: Fallback for Missing Translation Keys (FR-005)

**Decision**: The `useTranslation()` hook falls back to the `en` locale for any missing key. Since `fi.ts` will implement the full `Messages` type (TypeScript enforces completeness at compile time), runtime missing-key scenarios are prevented statically. No runtime fallback code is needed.

**Rationale**: TypeScript's structural typing ensures `fi.ts` must export an object satisfying `Messages`. If a key is missing, the build fails at compile time — a stronger guarantee than runtime fallback. The `en` fallback was specified as a safety net, but strict typing makes it a compile-time guarantee instead.

**Note**: The `loadState()` fallback for old stored settings (`settings: parsed.settings ?? { language: 'ja' }`) remains unchanged. If an old store somehow had an invalid language value, it would fall back to `'ja'`.

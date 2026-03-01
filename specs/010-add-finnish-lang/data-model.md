# Data Model: Finnish Language Support with Flag Icons

**Feature**: 010-add-finnish-lang | **Date**: 2026-03-01

## Changed Entities

### Language (type alias)

**Location**: `src/types/game.ts`

| Field | Before | After |
|-------|--------|-------|
| Type | `'ja' \| 'en'` | `'ja' \| 'en' \| 'fi'` |

**Constraints**: Must be one of the three string literals. Stored in `Settings.language`.

---

### Settings (interface)

**Location**: `src/types/game.ts`

No structural change. The `language` field now accepts `'fi'` via the expanded `Language` type.

```ts
interface Settings {
  language: Language  // now 'ja' | 'en' | 'fi'
}
```

**Persistence**: Stored in localStorage under key `molkky-score-v2` as part of `StoredState.settings`. No schema version bump required — adding `'fi'` as a valid value is backward-compatible (old saves with `'ja'` or `'en'` remain valid).

---

### GameAction — SET_LANGUAGE

**Location**: `src/types/game.ts`

No structural change. Already typed as `{ type: 'SET_LANGUAGE'; language: Language }` — automatically accepts `'fi'` after the `Language` type expansion.

---

## New Entities

### Messages (Finnish locale object)

**Location**: `src/i18n/fi.ts`

Satisfies the `Messages` type exported from `src/i18n/ja.ts`. Must implement all keys.

```ts
export const fi: Messages = {
  home: {
    title: "Mölkky Pisteet",
    newGame: "Uusi peli",
    resumeGame: "Jatka peliä",
    overwriteConfirm: "Nykyinen peli menetetään. Haluatko jatkaa?",
    confirmYes: "Jatka",
    confirmNo: "Peruuta",
  },
  setup: {
    title: "Pelaaja-asetukset",
    namePlaceholder: "Pelaajan nimi (max 12 merkkiä)",
    addPlayer: "Lisää",
    startGame: "Aloita peli",
    errorMinPlayers: "Vähintään 2 pelaajaa tarvitaan",
    errorMaxPlayers: "Enintään 10 pelaajaa sallittu",
    errorDuplicate: "Tämä nimi on jo rekisteröity",
    errorMaxLength: "Pelaajan nimi saa olla enintään 12 merkkiä",
    orderHint: "Muuta heittojärjestystä painikkeilla",
    shuffle: "Sekoita",
  },
  game: {
    currentTurn: "{name}'s vuoro",
    score: "Pisteet",
    remaining: "Jäljellä",
    misses: "Hutit",
    eliminated: "Poistettu",
    undo: "Kumoa",
    throwCount: (n: number) => `${n}. heitto`,
    howMany: "Pisteet?",
    bustMessage: "💥 Ylitys! Nollataan 25:een",
    eliminatedMessage: "❌ {name} on poistettu",
    winnerMessage: "{name} voittaa!",
  },
  result: {
    title: "Peli ohi",
    winner: "Voittaja: {name}",
    totalTurns: "{n} vuoroa",
    playAgain: "Pelaa uudelleen",
    newGame: "Uusi peli",
    share: "Jaa tulokset",
    sharePrefix: "🎯 Mölkky-tulokset",
    eliminated: "poistettu",
    turns: "vuoroa",
    rankSuffix: (_n: number) => ".",
  },
  molkkout: {
    title: "Mölkkout (ratkaisuheitto)",
    pinSetupGuide: "Aseta keilat tässä järjestyksessä: 6-4-12-10-8",
    start: "Aloita",
    teamTurn: "{team}'s vuoro ({player})",
    totalScore: "Yhteensä: {score}pt",
    winner: "{team} voittaa!",
    overtime: "Tasapeli! Jatkoaika",
  },
  common: {
    ok: "OK",
    cancel: "Peruuta",
    copied: "Kopioitu leikepöydälle",
    language: "Kieli",
  },
}
```

---

## Utility Functions

### detectLocale()

**Location**: `src/utils/i18n.ts`

```ts
export function detectLocale(): Language {
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  if (lang === 'fi') return 'fi'
  if (lang === 'en') return 'en'
  return 'ja'
}
```

**Inputs**: `navigator.language` (browser/OS locale string, e.g. `"fi-FI"`, `"en-US"`)
**Output**: `Language` — one of `'fi'`, `'en'`, `'ja'`
**Side effects**: None (pure read of browser API)
**Called from**: `GameContext.tsx` lazy initializer, only when `loadState()` returns `null`

---

## localStorage Schema

**Key**: `molkky-score-v2`
**Schema version**: `2` (unchanged — no bump required)

```ts
interface StoredState {
  version: 2
  game: Game | null
  molkkoutGame: MolkkoutGame | null
  settings: Settings  // settings.language now stores 'ja' | 'en' | 'fi'
}
```

**Migration**: None required. Adding `'fi'` as a valid `language` value is fully backward-compatible with existing saved states (`'ja'` and `'en'` values remain valid).

# Feature Specification: Finnish Language Support with Flag Icons

**Feature Branch**: `010-add-finnish-lang`
**Created**: 2026-03-01
**Status**: Draft
**Input**: User description: "フィンランド語対応したい。言語選択に視覚的な国旗アイコンも追加したい"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Play in Finnish (Priority: P1)

A Finnish-speaking user opens the Mölkky score app and switches the language to Finnish. All UI text — menus, game screens, buttons, and messages — appears in Finnish, allowing them to play comfortably in their native language.

**Why this priority**: Finnish is the origin language of Mölkky; supporting it dramatically expands accessibility for the core demographic of the game. Without this, the feature has no value.

**Independent Test**: Can be tested by selecting Finnish language and verifying all visible text across all screens displays in Finnish.

**Acceptance Scenarios**:

1. **Given** the app is in any language, **When** the user selects Finnish, **Then** all UI strings on every screen switch to Finnish immediately.
2. **Given** the user has selected Finnish, **When** they close and reopen the app, **Then** Finnish remains the active language.
3. **Given** the app is in Finnish, **When** the user starts and plays a complete game, **Then** every game message (turn indicator, score reset notification, elimination notice, winner announcement) appears in Finnish.

---

### User Story 2 - Select Language Using Flag Icons (Priority: P2)

A user opens the language selector and sees visual flag icons alongside each language option, making it easy to identify and choose a language regardless of literacy in that language.

**Why this priority**: Flag icons make language selection more intuitive and visually distinct, reducing the chance of accidental selection. This enhances usability for all users, not just Finnish speakers.

**Independent Test**: Can be tested by opening the language selector and confirming that each available language option displays its associated national flag icon.

**Acceptance Scenarios**:

1. **Given** the language selector is visible, **When** the user views it, **Then** each language option shows its flag emoji and short code (🇯🇵 JA, 🇬🇧 EN, 🇫🇮 FI).
2. **Given** the language selector is visible, **When** the user taps a flag icon for a language, **Then** the app immediately switches to that language.
3. **Given** the current language is Finnish, **When** the language selector is shown, **Then** the 🇫🇮 FI option is visually highlighted or marked as active.

---

### User Story 3 - Language Persists Across Sessions (Priority: P3)

A user selects Finnish once and expects not to have to re-select it every time they open the app. The preference is remembered between sessions.

**Why this priority**: Persistence is a basic expectation of a settings preference. Without it, the Finnish language selection is barely usable in practice.

**Independent Test**: Can be tested by selecting Finnish, closing the browser/app, reopening, and confirming Finnish is still active.

**Acceptance Scenarios**:

1. **Given** the user sets the language to Finnish, **When** they close and reopen the app, **Then** Finnish is still the active language.
2. **Given** the user sets the language to Finnish and starts a game, **When** they return to the home screen, **Then** the language remains Finnish.
3. **Given** the app is launched for the first time with no stored preference and the device/browser locale is `fi`, **When** the app loads, **Then** Finnish is automatically selected without any user action.

---

### Edge Cases

- On first launch with no stored preference, the app detects the browser locale: Finnish (`fi`) → Finnish, English (`en`) → English, all others → Japanese.
- Translation key completeness is enforced at compile time by the `Messages` type; missing keys cause a TypeScript build error (FR-005).
- How does the language selector handle layouts where all three flag icons plus labels are too wide for the available space on small (320px) screens?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a complete Finnish-language translation covering all user-visible strings across all screens (home, setup, game, result, Mölkkout).
- **FR-002**: The language selector MUST display each language option as a flag emoji paired with a short language code: 🇫🇮 FI, 🇯🇵 JA, 🇬🇧 EN.
- **FR-003**: Users MUST be able to select Finnish from the language selector and have all UI text update immediately to Finnish without a page reload.
- **FR-004**: The app MUST persist the selected language (including Finnish) across sessions so the user does not need to re-select on each visit.
- **FR-005**: If a Finnish translation key is missing, the app MUST fall back to English rather than displaying a blank or broken string.
- **FR-006**: The language selector MUST visually indicate which language is currently active.
- **FR-007**: All existing Japanese and English functionality MUST remain fully intact after adding Finnish support.
- **FR-008**: On first launch with no stored language preference, the app MUST detect the device/browser locale and automatically select Finnish if the locale is `fi`, English if `en`, or Japanese for all other locales.
- **FR-009**: The language selector MUST only be displayed on the Home screen and Setup screen. It MUST NOT appear on any in-game screen (Game screen, Result screen, Mölkkout screen).

### Key Entities

- **Language Setting**: A user preference (currently `'ja'` | `'en'`) extended to also include `'fi'`. Stored in persistent app state across sessions.
- **Translation Locale**: A complete set of key-value string mappings for a single language, covering all UI text in the app.
- **Language Selector**: The UI control used to switch between supported languages. Extended from a two-option toggle to a multi-option selector with flag icons.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Finnish-speaking user can complete a full game (setup → play → result) with all visible text in Finnish and zero English or Japanese strings visible.
- **SC-002**: The language selector displays flag icons for all three supported languages within a single visible area without layout overflow on screens 320px wide or larger.
- **SC-003**: Switching to Finnish takes effect immediately — all text updates without a page reload or navigation action.
- **SC-004**: All existing automated tests pass without modification after Finnish is added, confirming no regression in Japanese or English support.
- **SC-005**: Language selection (Finnish) is retained after the app is closed and reopened, verified across at least two session boundaries.

## Assumptions

- Each language option is displayed as an emoji flag paired with a short code: 🇫🇮 FI, 🇯🇵 JA, 🇬🇧 EN. Emoji flags require no additional image assets and are supported on all major platforms targeted by the app.
- On first launch with no stored preference, the app auto-detects the browser/device locale: `fi` → Finnish, `en` → English, all others → Japanese.
- Finnish translations are authored as part of this feature; no external translation service is used.
- The language selector appears only on the Home screen and Setup screen. It is not shown during an active game (Game screen, Result screen, Mölkkout screen).
- The language selector changes from a two-state toggle to a three-option selector; the exact visual form (button group, dropdown, etc.) is a planning-phase decision.

## Clarifications

### Session 2026-03-01

- Q: 初回起動時（保存された言語設定なし）のデフォルト言語はどうすべきか？ → A: ブラウザ/デバイスのロケールを自動検出する。`fi` → Finnish、`en` → English、それ以外 → 日本語
- Q: 言語セレクターの各オプションの表示形式は？ → A: 国旗絵文字 ＋ 短縮言語コード（🇫🇮 FI / 🇯🇵 JA / 🇬🇧 EN）
- Q: ゲームプレイ中に言語セレクターを表示するか？ → A: 表示しない。ホーム画面とセットアップ画面のみに限定する

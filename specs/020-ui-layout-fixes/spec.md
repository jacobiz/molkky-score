# Feature Specification: UI Layout Fixes

**Feature Branch**: `020-ui-layout-fixes`
**Created**: 2026-03-07
**Status**: Draft
**Input**: User description: "表示レイアウトの調整。 1. スコアシート印刷ボタンと右の閉じるボタンが近すぎるので間にもう少しスペースをいれる 2. ピン得点入力領域を最大で画面の下4割までにする 3. プレイヤー名入力画面の言語入力機能をなくす 4. スコアシートの50点到達マスの背景色をわかりやすくする"

## Clarifications

### Session 2026-03-07

- Q: Which cell in the scoresheet gets the 50-point highlight — the cumulative total cell or the round score cell? → A: The cumulative total cell (the running total that shows "50").
- Q: The 40% pin input panel height cap — relative to total viewport height or usable viewport height (excluding bottom safe area inset)? → A: 40% of the usable viewport height, excluding the bottom safe area inset.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scoresheet Print/Close Button Spacing (Priority: P1)

A user viewing a scoresheet on a mobile device opens the print dialog. The print button and the close (X) button are placed too close together, causing accidental taps on the wrong button. This change adds visible spacing between them to prevent mis-taps.

**Why this priority**: Accidental taps on the wrong button disrupt the user experience directly and have been explicitly reported.

**Independent Test**: Open the scoresheet modal, verify that the print button and close button have clear visual separation (not touching or overlapping), and that both are independently tappable without risk of hitting the wrong one.

**Acceptance Scenarios**:

1. **Given** the scoresheet modal is open, **When** the user views the header area, **Then** the print button and close button have sufficient gap between them so they are visually distinct and easy to tap separately.
2. **Given** a small mobile screen, **When** viewing the scoresheet header, **Then** neither button overlaps the other and both remain fully tappable.

---

### User Story 2 - Pin Input Area Height Constraint (Priority: P2)

During an active game, the pin input panel (where players tap pins to enter scores) can grow large and obscure the scoreboard. This change limits the pin input area to occupy at most the bottom 40% of the screen height, keeping the scoreboard visible above it.

**Why this priority**: Seeing the current scores while entering a new score is important for gameplay flow; hiding the scoreboard frustrates users.

**Independent Test**: Open an active game on various screen sizes, verify the pin input panel never exceeds 40% of the usable viewport height (excluding the bottom safe area inset), and the scoreboard remains visible above it.

**Acceptance Scenarios**:

1. **Given** an active game screen on any device, **When** the pin input panel is displayed, **Then** it occupies at most the bottom 40% of the usable viewport height (excluding the bottom safe area inset).
2. **Given** the pin input panel is at its maximum size, **When** the user scrolls or looks above it, **Then** the scoreboard is visible in the remaining usable area above it.
3. **Given** a very small screen, **When** the pin input panel would normally exceed 40% of the usable viewport height, **Then** the panel becomes scrollable internally rather than expanding beyond the 40% limit.

---

### User Story 3 - Remove Language Selector from Player Name Setup (Priority: P3)

On the player name input screen (SetupScreen), a language selector is currently shown. Since language can be changed elsewhere or is not relevant at this step, removing it simplifies the setup flow and reduces visual clutter.

**Why this priority**: This is a simplification/cleanup change that reduces confusion; the core setup flow still works without it.

**Independent Test**: Navigate to the player name input screen, verify no language selector control is displayed on that screen.

**Acceptance Scenarios**:

1. **Given** the player name setup screen, **When** it is displayed, **Then** no language selector control is visible.
2. **Given** the player name setup screen, **When** the user sets player names and proceeds, **Then** the language setting is unaffected (previously selected language remains active).

---

### User Story 4 - Scoresheet 50-Point Cumulative Total Cell Highlight (Priority: P4)

In Mölkky, reaching exactly 50 points wins the game. The scoresheet shows each player's cumulative total per round, but the cumulative total cell where a player reaches 50 points is not visually distinct. This change applies a clearly visible background color to that cumulative total cell so players can immediately spot winning scores.

**Why this priority**: Visual clarity of the win condition is important for game comprehension, but the game already functions correctly without it.

**Independent Test**: Open the scoresheet for a completed game where a player reached 50 points, verify the cumulative total cell showing "50" has a distinct, recognizable background color different from all other cells.

**Acceptance Scenarios**:

1. **Given** a scoresheet where a player's cumulative total reached exactly 50, **When** the scoresheet is displayed, **Then** the cumulative total cell showing "50" has a clearly visible distinct background color.
2. **Given** a scoresheet where no player has reached 50 points, **When** the scoresheet is displayed, **Then** no cumulative total cell has the 50-point highlight background color.
3. **Given** a scoresheet where a player exceeded 50 points (and was reset to 25), **When** the scoresheet is displayed, **Then** only the cumulative total cell that actually shows "50" is highlighted, not subsequent cells.

---

### Edge Cases

- What happens when the scoresheet print button and close button are on very narrow screens where space is limited — buttons should remain accessible even if spacing is reduced.
- What happens when the pin input area content is taller than 40% of the screen — the content must scroll internally without breaking the layout.
- What happens if the player setup screen is opened while a non-default language is active — the language setting must persist correctly even without the language selector being present.
- What happens if multiple players reach 50 points (e.g., in separate games replayed) — each relevant cumulative total cell should be highlighted independently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The scoresheet modal header MUST display the print button and close button with sufficient spacing between them so that they are visually distinct and independently tappable on mobile devices.
- **FR-002**: The pin score input panel in the active game screen MUST be constrained to a maximum height of 40% of the usable viewport height (excluding the bottom safe area inset).
- **FR-003**: When the pin input panel content exceeds the 40% height limit, the panel MUST scroll internally to allow access to all controls without expanding beyond the limit.
- **FR-004**: The player name setup screen MUST NOT display a language selector control.
- **FR-005**: Removing the language selector from the player name setup screen MUST NOT affect the user's current language setting — the previously selected language MUST remain active.
- **FR-006**: In the scoresheet view, the cumulative total cell where a player's running total reached exactly 50 points MUST be displayed with a visually distinct background color that clearly differentiates it from other cells.
- **FR-007**: The 50-point highlight background color MUST be distinguishable from the default cell background and from any other special-state cell colors already in use.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can tap the print button and close button on the scoresheet modal independently without accidentally activating the wrong button, on screens 320px wide or wider.
- **SC-002**: The pin input panel never occupies more than 40% of the usable viewport height (excluding the bottom safe area inset) during active gameplay across all supported screen sizes.
- **SC-003**: The player name setup screen displays zero language selector elements after the change.
- **SC-004**: Users can visually identify which scoresheet cumulative total cell corresponds to a player winning (reaching 50 points) within 3 seconds of viewing the scoresheet, without any explanation.

## Assumptions

- The scoresheet modal already has a header row containing both a print button and a close button; this change only adjusts spacing between them, not their position or function.
- "Pin input area" refers to the pin-selection panel shown at the bottom of the GameScreen during active play.
- The language selector on the player name setup screen is the only language-related UI element on that screen; other screens retain their language controls.
- The 50-point cumulative total cell highlight should use a positive/success color (e.g., green family) to indicate a win state, consistent with common game UI conventions.
- The scoresheet already tracks cumulative totals per round; no data model changes are needed, only visual rendering changes.

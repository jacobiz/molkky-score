# Feature Specification: Mölkkout Setup Refactor

**Feature Branch**: `013-molkkout-setup-refactor`
**Created**: 2026-03-02
**Status**: Draft
**Input**: User description: "モルックアウト機能を改修する。セッティングで入力するのはチーム名のみ(プレイヤーは入力しない。投球順はルールによるため、ユーザ側に委ねる)。代わりに総投球数を入力できるようにする(前提:全チームの投球数は同じ。1人チーム同士の場合は3投、2人チーム同士の場合は2*2=4投になる)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mölkkout Setup with Team Names and Total Throws (Priority: P1)

A group of players wants to start a Mölkkout tiebreaker. They enter team names (without listing individual players) and specify how many total throws each team gets. The throwing order within each team is determined physically by the players themselves following the official rules—the app does not track this.

**Why this priority**: This is the entry point to the entire Mölkkout feature. Without a working setup screen, no game can start. Simplifying setup by removing player name input reduces friction and aligns with how the rules actually work (throwing order is the players' responsibility).

**Independent Test**: Can be fully tested by opening the Mölkkout setup screen, entering 2 team names and a throw count, tapping Start, and confirming the game screen shows those team names with the correct throw count.

**Acceptance Scenarios**:

1. **Given** the Mölkkout setup screen is open, **When** the user enters names for 2 teams and sets total throws to 3, **Then** tapping Start launches the Mölkkout game with 2 teams each having 3 throws.
2. **Given** the setup screen is open, **When** the user tries to start without filling in all team names, **Then** an error message is shown and the game does not start.
3. **Given** the setup screen is open, **When** the user adds a third team and fills all names, **Then** the game starts with 3 teams all sharing the same throw count.
4. **Given** the setup screen is open, **When** the user sets total throws to 4 (for 2-player teams), **Then** the game tracks exactly 4 throws per team with no player name display.

---

### User Story 2 - Mölkkout Game Screen Without Player Tracking (Priority: P2)

During the Mölkkout game, the score screen shows which team is currently throwing and how many throws have been used (e.g., "Throw 2 of 3"), without displaying or tracking individual player names. Players physically determine their own rotation.

**Why this priority**: The game screen must reflect the simplified data model—no player name display since the setup no longer collects it. Without this, the refactored setup produces a broken game screen.

**Independent Test**: Can be tested by starting a Mölkkout game and verifying the game screen shows "Team A — Throw N of M" format without any player name fields, and advances correctly after each throw entry.

**Acceptance Scenarios**:

1. **Given** a Mölkkout game is active, **When** it is Team A's turn, **Then** the screen shows Team A's name and the current throw number out of total throws (e.g., "Throw 1 of 3") with no player name shown.
2. **Given** Team A has completed all their throws, **When** turns are exhausted for that team, **Then** the screen advances to Team B's first throw.
3. **Given** all teams have completed all throws, **When** one team has the highest score, **Then** the winner is declared.
4. **Given** all teams complete throws with equal scores, **When** overtime begins, **Then** each team gets one additional throw (same as current overtime rules).

---

### Edge Cases

- What happens when the user sets total throws to 0 or leaves it blank? → The app must require a positive integer (minimum 1).
- What happens when only 1 team name is entered? → The app must require at least 2 teams.
- What happens when total throws is very large (e.g., 99)? → The app should cap throws at a reasonable maximum (e.g., 10 per team).
- What happens to previously saved Mölkkout game state (with player names) after this change? → Saved games with the old schema should be gracefully discarded or migrated; a stale game with player names must not crash the new game screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Mölkkout setup screen MUST allow users to enter team names only; individual player name fields are removed.
- **FR-002**: The setup screen MUST provide a single input for total throws per team, shared by all teams.
- **FR-003**: The total throws input MUST accept positive integers from 1 to 10 (inclusive); values outside this range are rejected with an error message.
- **FR-004**: The setup screen MUST require at least 2 teams and allow up to 6 teams (same as current limit).
- **FR-005**: The setup screen MUST require all team names to be non-empty before allowing the game to start.
- **FR-006**: The Mölkkout game screen MUST display the current team name and throw progress (e.g., "Throw 2 of 4") without any player name.
- **FR-007**: The Mölkkout game screen MUST advance to the next team after the current team exhausts their total throws.
- **FR-008**: Winner determination and overtime rules MUST remain unchanged from the current implementation.
- **FR-009**: The app MUST handle existing saved Mölkkout game data (old schema with player names) without crashing; stale data is discarded and the user is returned to the home screen.

### Key Entities

- **MölkkoutTeam**: Represents a competing team. Attributes: name (string), total score (number). Player names are removed.
- **MölkkoutGame**: Represents an active Mölkkout session. Attributes: teams list, current team index, current throw index within team, total throws per team (shared), turns history, game status, winner.
- **MölkkoutTurn**: Records a single throw outcome. Attributes: team identifier, points scored. Player name field is removed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete Mölkkout setup in under 30 seconds with 2 teams.
- **SC-002**: 100% of Mölkkout setups succeed without error when at least 2 team names are entered and a valid throw count is provided.
- **SC-003**: The game screen correctly advances team turns for all valid combinations of 2–6 teams with 1–10 throws per team.
- **SC-004**: No crash or data corruption occurs when launching the app with old Mölkkout game data saved in storage.

## Assumptions

- All teams always have the same total throws (as stated by user). A heterogeneous throw count per team is out of scope.
- The total throws value represents the total count for the whole team (not per player). E.g., 3 means the team as a whole throws 3 times.
- Maximum teams remain 6, same as current implementation.
- The suggested default for total throws in the UI is 3 (the 1-player-team standard), but users can freely change it.
- Throw count capped at 10 to prevent UI overflow; this can be revisited if needed.
- i18n keys for the new UI elements will be added to all three languages (ja, en, fi).

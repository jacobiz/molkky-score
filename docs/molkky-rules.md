# Mölkky (Molkky) – Complete Game Rules and Reference

> Knowledge base for the Mölkky scoring application design.
> Research compiled from official rules, championship guidelines, and authoritative sources.
> Last updated: 2026-02-28

---

## Table of Contents

1. [Game Overview and History](#1-game-overview-and-history)
2. [Equipment](#2-equipment)
3. [Pin Setup and Initial Arrangement](#3-pin-setup-and-initial-arrangement)
4. [Basic Gameplay and Turn Structure](#4-basic-gameplay-and-turn-structure)
5. [Scoring System](#5-scoring-system)
6. [Winning Conditions](#6-winning-conditions)
7. [Penalty Rules](#7-penalty-rules)
8. [Pin Placement After Each Throw](#8-pin-placement-after-each-throw)
9. [Players and Teams](#9-players-and-teams)
10. [Tiebreaker: Mölkkout](#10-tiebreaker-mölkkout)
11. [Tournament and Championship Rules](#11-tournament-and-championship-rules)
12. [Official vs. Casual Variations](#12-official-vs-casual-variations)
13. [Strategy and Tactics](#13-strategy-and-tactics)
14. [Scoring App Design Considerations](#14-scoring-app-design-considerations)
15. [Quick Reference Card](#15-quick-reference-card)
16. [Sources](#16-sources)

---

## 1. Game Overview and History

### What is Mölkky?

Mölkky (also spelled Molkky, pronounced approximately "MUHL-koo" in Finnish) is a Finnish outdoor
throwing game invented in 1996 by the Lahden Paikka company (formerly known as Tuoterengas), based
in Lahti, Finland. It is one of Finland's most popular outdoor leisure games and has since spread
globally.

### Origins

The game is based on **kyykkä** (also known as Finnish Skittles or Karelian Skittles), a
centuries-old Karelian throwing game. Unlike kyykkä, Mölkky requires less physical strength and is
suitable for all ages and fitness levels. Success in Mölkky is based on a combination of chance
and skill.

The word "mölkky" was coined by its creators and has no literal meaning in Finnish. It was likely
inspired by the Finnish word *pölkky*, meaning "block of wood."

### Growth and Championships

- **1996**: Game invented and first sold commercially
- **1997**: First Finnish Mölkky Championships held in Lahti
- **2004**: First World Championships held in Lahti, Finland
- **2015**: Last World Championship in Lahti, Finland
- **2016**: First World Championship outside Finland, held in Le Rheu (near Rennes), France
- **Ongoing**: World Championships held annually, attracting 200+ teams

The International Mölkky Organisation (IMO) oversees international competition and standardises
rules across countries.

---

## 2. Equipment

A regulation Mölkky set consists of **13 pieces of birch wood**:

### Throwing Pin (Tikku / Mölkky)

- Length: **22.5 cm** (8.9 inches)
- Diameter: **5.9 cm** (2.3 inches)
- Material: Birch wood
- This is the single pin used for throwing at the numbered target pins

### Numbered Target Pins (Keilat / Skittles)

- Count: **12 pins**, numbered 1 through 12
- Height: **15 cm** (5.9 inches)
- Diameter: **5.9 cm** (2.3 inches)
- Shape: Flat at the base, bevelled at the top at a **45° angle**
- Material: Birch wood
- Each pin has its number marked on the bevelled top face

### Throwing Line Marker (Mölkkaari)

- Made from four interconnected pieces of wood
- Each piece: 24 cm (9.45 in) long × 3.2 cm (1.26 in) wide × 1.8 cm (0.71 in) thick
- Forms the arc/line behind which all throws must be made

---

## 3. Pin Setup and Initial Arrangement

### Placement Distance

The nearest pin is placed **3.5 metres (11.5 feet)** from the throwing line at the start of the
game. Casual games may use 3–4 metres (10–13 feet) depending on skill level.

### Pin Formation

The 12 numbered pins are arranged in a **tight triangular formation** (blunt triangle / pyramid
shape), packed together so they touch each other. The formation has **4 rows** with the lowest
numbers at the front (closest to the throwing line):

```
Row 1 (front, closest to thrower):       1   2
Row 2:                                 3  10   4
Row 3:                               5  11  12   6
Row 4 (back, furthest from thrower):   7   9   8
```

**Visual layout (as seen from above, thrower at bottom):**

```
         [7] [9] [8]          <- Row 4 (back)
       [5] [11] [12] [6]      <- Row 3
          [3] [10] [4]        <- Row 2
             [1] [2]          <- Row 1 (front)

              THROWER
```

### Key Notes on Setup

- All pins stand **upright** at the start
- Pins are **packed tightly** so they touch each other
- Numbers face **toward the throwing zone** (the bevelled/angled top shows the number to the players)
- The formation creates a dense cluster that will scatter as the game progresses
- Pins 1 and 2 are the "guard pins" at the front

---

## 4. Basic Gameplay and Turn Structure

### Objective

Players (or teams) take turns throwing the Mölkky stick at the numbered target pins, aiming to
score **exactly 50 points** before any other player or team.

### Turn Structure

1. The active player stands **behind the throwing line** (mölkkaari)
2. The player **throws the Mölkky underhand** toward the target pins
   - No run-up is allowed
   - All throwing styles are permitted as long as the player does not step over the line
3. Points are calculated based on which pins were knocked down (see Scoring System)
4. Knocked-down pins are **stood upright at the exact spot where they landed** (see Pin Placement)
5. Play passes to the **next player or team**

### Throwing Rules

- The throw must be made from **behind** the throwing line
- Stepping over the throwing line during or after the throw constitutes a **foul** (counts as a miss)
- Any throwing style/grip is permitted provided the player stays behind the line
- The Mölkky is thrown **underhand** (underarm)

### Order of Play

- A draw (coin toss or other method) determines who throws first
- Players take turns in a **fixed rotation** for the entire game
- The throwing order does not change during a game

---

## 5. Scoring System

### Core Scoring Rule

Scoring depends entirely on **how many pins** are knocked down in a single throw:

| Pins knocked down | Points scored |
|---|---|
| **0 pins** | 0 points (counts as a miss) |
| **Exactly 1 pin** | The **number printed on that pin** (e.g., pin #12 = 12 points) |
| **2 or more pins** | The **count of pins knocked down** (e.g., 3 pins = 3 points, regardless of pin values) |

### Examples

| Throw result | Points |
|---|---|
| Miss (no pins down) | 0 |
| Only pin #12 falls | 12 |
| Only pin #7 falls | 7 |
| Only pin #1 falls | 1 |
| Pins #3, #10, #4 all fall (3 pins) | 3 |
| Pins #11, #12 fall (2 pins) | 2 |
| All 12 pins fall | 12 |

**Key insight:** Hitting a cluster of high-value pins can actually score fewer points than
carefully toppling a single high-value pin. This is a core strategic tension of the game.

### What Counts as "Knocked Down"?

- **COUNTS as knocked down**: Pin lying flat on the ground; pin resting against an artificial element (cement border, bench, wall)
- **DOES NOT count as knocked down**: Pin leaning on another pin (still in equilibrium); pin resting on the Mölkky throwing stick; pin resting on a natural element (tree stump, rock)

---

## 6. Winning Conditions

### Primary Win Condition

The **first player or team to reach exactly 50 points** wins the game immediately.

### The Bust Rule (Exceeding 50)

If a player's score would exceed 50 points after a throw:
- Their score is **immediately reset to 25 points**
- They continue playing from 25
- This "bust" can happen repeatedly

### Survival Win

If all other players are eliminated via the three-miss rule before anyone reaches 50, the
**last remaining player wins** regardless of their current score.

---

## 7. Penalty Rules

### Miss Definition

A "miss" occurs when:
1. The player throws the Mölkky and **no pins are knocked down**
2. The player **steps over the throwing line** during their throw (foul)

### Three Consecutive Misses = Elimination

If a player records **three consecutive misses**, they are **eliminated from the game**.

- The miss counter resets to **zero** whenever a player scores any points (even 1 point)
- A player at 2 misses who then scores on their next turn has their counter reset to 0
- There is no partial reset — any score clears the entire consecutive miss count

**Miss tracking for scoring apps:**
```
miss_count: 0 → 1 → 2 → 3 (ELIMINATED)
Any score:  any_count → 0 (reset)
```

### Exceeding 50 Points (Bust)

- Score resets to **25 points** (not to 0)
- The bust itself does **not** count as a miss

### Optional: The 37-Point Rule

Some tournament settings use the **37-point rule**: if a player is stuck at exactly 37 points
for three consecutive turns, they are eliminated. This is an optional advanced rule.

---

## 8. Pin Placement After Each Throw

### Knocked-Down Pins

1. After each throw, any pin that was knocked down is **stood upright at the exact spot where it came to rest** (not returned to the original position)
2. The pin is stood with its **number facing the throwing zone**
3. Pins are not moved back into a cluster — they remain scattered wherever they fell

### Pins Knocked Outside the Playing Field

If a pin is knocked outside the designated playing area:
1. It is stood upright **just inside the boundary** of the playing field
2. It is placed at a **Mölkky's length from the border**

### Effect Over Time

As the game progresses, pins scatter across the field, creating:
- Greater distances between pins
- Awkward angles for targeting specific pins
- Obstacles that block direct paths to desired targets
- Increasing difficulty in precision throwing

---

## 9. Players and Teams

### Player Count

- **Minimum**: 2 players
- **Maximum**: Unlimited
- **Recommended**: 3–6 players for the best experience
- **Tournament standard**: Teams of 2–4 players (with 1–2 substitutes permitted)

### Individual Play

Each player throws the Mölkky once per turn. Players take turns in a fixed order.

### Team Play

- Team members take turns throwing in a fixed rotation
- All team members share a single score
- The throwing order within the team is fixed before the game starts
- Substitutions are only permitted **between games** in tournament settings

---

## 10. Tiebreaker: Mölkkout

### When Is Mölkkout Used?

Mölkkout determines a winner when two teams or players finish with an **equal score** in
competitive/tournament settings.

### Mölkkout Pin Setup

Five specific pins are used, placed in a **straight line** with the spacing of one Mölkky's length between each pin:

```
[6] --- [4] --- [12] --- [10] --- [8]
 ^
 |
3.5m from throwing line
```

- Pins placed in order: **6, 4, 12, 10, 8** (left to right from the throwing zone perspective)
- Distance between pins: one Mölkky stick length
- First pin (#6) is placed **3.5 metres** from the throwing line
- When a pin is knocked down, it is **stood back up at its starting position** (not left where it fell)

### Mölkkout Scoring

- Same scoring rules as regular play: 1 pin = face value, 2+ pins = count
- Knocked pins reset to their starting position after each throw

### Number of Throws per Team

| Team size | Throws per player |
|---|---|
| 1 player | 3 throws |
| 2 players | 2 throws each |
| 3+ players | 1 throw each |

### Mölkkout Winner

- The team with the **most total points** after all throws wins
- If still tied, each player gets **one additional throw** until one team scores more

---

## 11. Tournament and Championship Rules

### Tournament Format

- Typically **best-of-three** format between teams
- The losing team of each game chooses whether to throw first or second in the next game

### Team Composition

- **Active players**: 2–4 per team
- **Substitutes**: 1–2 permitted
- Substitutions only between games

### Time Rules

- Players have a **shot clock** of 30–45 seconds per throw
- Exceeding the time limit may result in a foul

### Strict Foul Enforcement

In tournaments, foot faults are enforced strictly:
- Any part of the foot crossing the line = foul
- Result: throw is void; a miss is recorded

---

## 12. Official vs. Casual Variations

### Core Rules (Universal)

These rules are consistent across all versions:
- 12 numbered pins, target score of exactly 50
- Single pin = face value; multiple pins = count of pins
- Score > 50 resets to 25
- Three consecutive misses = elimination

### Throwing Distance Variations

| Context | Distance |
|---|---|
| Official/Tournament | 3.5 m (11.5 ft) exactly |
| Adults (casual) | 3–4 m (10–13 ft) |
| Children (casual) | ~2.4 m (8 ft) |

### Optional Rules Not in Official Standard

| Rule | Description | Usage |
|---|---|---|
| **37-point rule** | Player stuck at exactly 37 for 3 turns is eliminated | Some tournaments |
| **Mölkkout** | Tiebreaker mini-game | Competitive/tournament play |
| **Shot clock** | 30–45 seconds per throw | Tournament play only |

---

## 13. Strategy and Tactics

### Early Game Strategy (Score < 30)

- **Target high-value single pins** (#10, #11, #12) early when the cluster is tight
- Group throws can be risky: hitting multiple pins scores count, not value
- With pins tightly packed at the start, precision single-pin targeting is genuinely difficult

### Mid Game Strategy (Score 30–40)

- Transition to **precision single-pin targeting**
- Monitor all players' scores — adjust to defensive or offensive play
- Plan the path to 50: which combinations of remaining pins sum to the needed score?

### Endgame Strategy (Score 40–50)

| Current score | Points needed | Options |
|---|---|---|
| 48 | 2 | Hit only the #2 pin, OR knock exactly 2 pins |
| 49 | 1 | Must hit **only** the #1 pin; any other result is bust or miss |
| 47 | 3 | Hit single #3, or knock exactly 3 pins |
| 45 | 5 | Hit single #5, or knock exactly 5 pins |
| 38 | 12 | Hit single #12, or knock exactly 12 pins |

The hardest endgame positions:
- **49 points**: Only the #1 pin saves you. Any other single pin busts you.
- **48 points**: Need exactly 2 — only #2 (single) or exactly 2 pins of any value.

### Defensive Strategy

- When opponents are close to 50, leave guard pins (low-value pins like #1 and #2) in front of the pins the opponent needs
- Scatter pins deliberately to create awkward throwing angles for opponents

### Miss Management

- Never get to 2 consecutive misses without changing strategy
- At 2 misses, take a safer/easier shot targeting any pin
- Even scoring 1 point (hitting the #1 pin) resets the miss counter completely

---

## 14. Scoring App Design Considerations

### Player/Team Management

- Support 2 to 12+ players or teams
- Track individual players and/or teams
- Allow setting player/team names before game starts
- Record throwing order (fixed for the entire game)

### Score Tracking Per Turn

Each turn requires recording:
1. **Number of pins knocked down** (0–12)
2. Whether it was **1 pin** (use face value) or **2+ pins** (use count)
3. Resulting points for the turn
4. **Cumulative score** after the throw
5. Whether the throw resulted in a **bust** (score > 50 → reset to 25)
6. Whether the throw was a **miss** (0 pins)
7. **Consecutive miss count** (0, 1, or 2; at 3 = eliminated)

### Automatic Rule Enforcement

The app should automatically handle:
- **Bust detection**: if `new_total > 50`, set score to 25
- **Elimination detection**: if `consecutive_misses >= 3`, mark player eliminated
- **Win detection**: if `new_total == 50`, declare winner and end game
- **Miss counter reset**: any score > 0 resets miss counter to 0
- **Foul recording**: stepping over line = miss (0 points, miss counter +1)

### Player State Machine

```
States: ACTIVE | ELIMINATED | WINNER

Transitions:
  ACTIVE → ELIMINATED   when consecutive_misses == 3
  ACTIVE → WINNER       when score == 50
  ACTIVE → ACTIVE       otherwise (continue game)
```

### Score Calculation Logic

```
function calculate_score(current_score, pins_knocked_down, pin_face_value?):
  if pins_knocked_down == 0:
    return current_score, is_miss=true

  if pins_knocked_down == 1:
    points = pin_face_value  // value of the single pin knocked down
  else:
    points = pins_knocked_down  // count of pins knocked down

  new_score = current_score + points

  if new_score > 50:
    new_score = 25  // bust rule

  return new_score, is_miss=false
```

### Mölkkout (Tiebreaker) Mode

The app should support a Mölkkout mode with:
- 5-pin setup (#6, #4, #12, #10, #8)
- Standard scoring rules apply
- Knocked pins reset to their starting positions after each throw
- Configurable throws per player (based on team size: 3/2/1 throw(s))
- Running totals per team
- Winner determination and tie-resolution (extra throw rounds)

### Undo/Correction Feature

Essential for usability:
- Ability to undo the last throw (revert score, miss counter, elimination status)
- Ideally full turn history with ability to correct any entry

### Display Requirements

- Current score for each player/team, prominently displayed
- Points needed to win (50 - current_score) for each active player
- Consecutive miss count (warn visually at 2 misses)
- Eliminated players clearly marked
- Turn history / score log
- Clear indicator of whose turn it is

### Game Configuration Options

| Setting | Default | Notes |
|---|---|---|
| Target score | 50 | Standard |
| Bust reset score | 25 | Standard |
| 37-point rule | Off | Optional toggle |
| Shot clock | Off | Optional, configurable duration |
| Throwing distance | 3.5 m | Display only (informational) |

---

## 15. Quick Reference Card

### Setup

- 12 numbered pins in 4-row triangle: `1-2 / 3-10-4 / 5-11-12-6 / 7-9-8`
- Nearest pin: **3.5 m** from throwing line
- Pins packed tight, numbers facing throwers

### Scoring

- **1 pin knocked**: score = **pin's number**
- **2+ pins knocked**: score = **count of pins** (not values)
- **0 pins knocked**: **miss** (no points)

### Win/Bust

- **Win**: reach exactly **50**
- **Bust** (> 50): score resets to **25**

### Elimination

- **3 consecutive misses** = eliminated
- Any score > 0 resets miss counter to 0
- Foul (step over line) = miss

### Pin Placement

- Knocked pins stand up **where they fell** (numbers toward thrower)
- Out-of-bounds pins: stand just inside boundary, one Mölkky-length from edge

### Tiebreaker (Mölkkout)

- 5 pins in a line: **6 — 4 — 12 — 10 — 8**
- Knocked pins **reset to start** after each throw
- Throws per player: 3 (solo), 2 (pairs), 1 (3+ per team)
- Highest total wins; tie → extra throw per player until decided

---

## 16. Sources

- [Mölkky World – Official Rules](https://www.molkky.world/molkky-rules)
- [Mölkky Oy – Official Manufacturer Rules](https://www.molkky.com/game/rules/)
- [Mölkky – Wikipedia](https://en.wikipedia.org/wiki/M%C3%B6lkky)
- [How to Play Mölkky – Toss Cornhole](https://tosscornhole.com/how-to-play-molkky/)
- [Molkky Rules – Group Games 101](https://groupgames101.com/molkky-rules/)
- [Mölkky Rules – Mölkkyversum](https://www.moelkkyversum.de/en/molkky/rules/)
- [Mölkkout Rules – Mölkkyversum](https://www.moelkkyversum.de/en/molkky/rules/molkkout/)
- [Mölkky Strategy Guide – Elakai Outdoor](https://elakaioutdoor.com/blogs/lifestyle/molkky-strategy-101-how-to-outsmart-your-opponents-and-win-every-game)
- [Mölkky History – Elakai Outdoor](https://elakaioutdoor.com/blogs/lifestyle/the-history-of-molkky-from-finnish-roots-to-global-fun)
- [International Mölkky Organisation](https://www.international-molkky.org/)
- [Mölkky Rules – The Backyard Baron](https://www.thebackyardbaron.com/how-to-play-molkky/)
- [Mölkky Rules – Molkky Canada](https://molkkycanada.ca/molkky-rules/)

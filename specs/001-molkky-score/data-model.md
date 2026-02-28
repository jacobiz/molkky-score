# Data Model: Mölkky スコア管理アプリ

**Branch**: `001-molkky-score` | **Date**: 2026-02-28

---

## エンティティ一覧

| エンティティ | ファイル | 説明 |
|---|---|---|
| `PlayerStatus` | `types/game.ts` | プレイヤーの状態（列挙型） |
| `Player` | `types/game.ts` | プレイヤー情報とゲーム内状態 |
| `Turn` | `types/game.ts` | 1回の投球記録（アンドゥスタックの要素） |
| `Game` | `types/game.ts` | ゲーム全体の状態 |
| `MolkkoutTeam` | `types/game.ts` | Mölkkout のチーム |
| `MolkkoutTurn` | `types/game.ts` | Mölkkout の1投球記録 |
| `MolkkoutGame` | `types/game.ts` | Mölkkout ゲーム全体 |
| `Settings` | `types/game.ts` | アプリ設定（言語等） |
| `GameState` | `types/game.ts` | アプリ全体の状態（Context の root） |
| `GameAction` | `types/game.ts` | Reducer に渡すアクション（Union Type） |

---

## 型定義

```typescript
// src/types/game.ts

// ─────────────────────────────────────────
// Player
// ─────────────────────────────────────────

export type PlayerStatus = 'active' | 'eliminated' | 'winner'

export interface Player {
  /** 一意な ID（セットアップ時に生成） */
  id: string
  /** プレイヤー名（最大10文字、同一ゲーム内で一意） */
  name: string
  /** 現在の累積スコア（0〜50） */
  score: number
  /** 連続ミス回数（0〜3、3で脱落） */
  consecutiveMisses: number
  /** プレイヤーの状態 */
  status: PlayerStatus
}

// ─────────────────────────────────────────
// Turn（アンドゥスタックの要素）
// ─────────────────────────────────────────

export interface Turn {
  /** 投球したプレイヤーの ID */
  playerId: string
  /** 倒したピンの本数（0〜12） */
  pinsKnockedDown: number
  /**
   * 1本倒した場合のピン番号（1〜12）。
   * 0本または2本以上の場合は null。
   */
  pinNumber: number | null
  /** このターンで獲得した得点 */
  points: number
  /** バーストが発生したか（score > 50 → reset to 25） */
  isBust: boolean
  /** ミスだったか（0本 or ファウル） */
  isMiss: boolean
  /**
   * このターン適用後のプレイヤーの状態スナップショット。
   * アンドゥ時の完全な状態復元に使用。
   */
  playerSnapshotBefore: Player
}

// ─────────────────────────────────────────
// Game
// ─────────────────────────────────────────

export type GameStatus = 'active' | 'finished'

export interface Game {
  /** プレイヤーリスト（投球順） */
  players: Player[]
  /** 現在のターンプレイヤーのインデックス（players 配列のインデックス） */
  currentPlayerIndex: number
  /** ゲームの状態 */
  status: GameStatus
  /** 勝者のプレイヤー ID（status が 'finished' の場合のみ設定） */
  winnerId: string | null
  /** 総ターン数（表示・シェア用） */
  totalTurns: number
  /**
   * 投球履歴スタック（アンドゥ用）。
   * 末尾が最新のターン。push/pop で操作。
   */
  turnHistory: Turn[]
}

// ─────────────────────────────────────────
// Mölkkout（タイブレーカー）
// ─────────────────────────────────────────

/** Mölkkout の5本ピン（順番固定） */
export const MOLKKOUT_PINS = [6, 4, 12, 10, 8] as const

export interface MolkkoutTeam {
  id: string
  name: string
  /** 各プレイヤーのスロット（名前リスト） */
  playerNames: string[]
  /** 合計スコア */
  totalScore: number
}

export interface MolkkoutTurn {
  teamId: string
  playerName: string
  pinsKnockedDown: number
  pinNumber: number | null
  points: number
}

export interface MolkkoutGame {
  teams: MolkkoutTeam[]
  /** チームの投球順インデックス */
  currentTeamIndex: number
  /** 現在チーム内の投球者インデックス */
  currentPlayerInTeamIndex: number
  /**
   * チームサイズ別の1人あたり投球数。
   * 1人: 3投、2人: 2投ずつ、3人以上: 1投ずつ
   */
  throwsPerPlayer: number
  turns: MolkkoutTurn[]
  status: 'active' | 'finished' | 'overtime'
  winnerId: string | null
}

// ─────────────────────────────────────────
// Settings
// ─────────────────────────────────────────

export type Language = 'ja' | 'en'

export interface Settings {
  language: Language
}

// ─────────────────────────────────────────
// App Screen（ルーティング）
// ─────────────────────────────────────────

export type Screen =
  | 'home'
  | 'setup'
  | 'game'
  | 'result'
  | 'molkkout-setup'
  | 'molkkout-game'

// ─────────────────────────────────────────
// Root State（Context の root）
// ─────────────────────────────────────────

export interface GameState {
  screen: Screen
  game: Game | null
  molkkoutGame: MolkkoutGame | null
  settings: Settings
}

// ─────────────────────────────────────────
// Actions（Reducer に渡す Union Type）
// ─────────────────────────────────────────

export type GameAction =
  // ─ ナビゲーション ─
  | { type: 'NAVIGATE'; screen: Screen }

  // ─ ゲームセットアップ ─
  | { type: 'START_GAME'; playerNames: string[] }

  // ─ スコア入力 ─
  | {
      type: 'RECORD_TURN'
      pinsKnockedDown: number
      /** 1本の場合のみ指定（1〜12） */
      pinNumber: number | null
    }

  // ─ アンドゥ ─
  | { type: 'UNDO_TURN' }

  // ─ ゲーム終了後 ─
  | { type: 'RESTART_GAME' }   // 同じプレイヤーでリスタート
  | { type: 'NEW_GAME' }       // セットアップに戻る

  // ─ Mölkkout ─
  | { type: 'START_MOLKKOUT'; teams: { name: string; playerNames: string[] }[] }
  | {
      type: 'RECORD_MOLKKOUT_TURN'
      pinsKnockedDown: number
      pinNumber: number | null
    }

  // ─ 設定 ─
  | { type: 'SET_LANGUAGE'; language: Language }
```

---

## 状態遷移

### Player.status

```
active → eliminated   consecutiveMisses === 3
active → winner       score === 50
active → active       それ以外（通常のターン）
```

### Game.status

```
active → finished     winner が確定した瞬間（score===50 または 最後の1人が残った）
```

### Screen（ナビゲーション）

```
home
  ├─ [新規ゲーム開始] → setup
  └─ [ゲームを再開]   → game（保存された game を復元）

setup
  └─ [ゲーム開始]     → game

game
  └─ [勝者確定]       → result

result
  ├─ [もう一度プレイ]          → game（スコアリセット、同メンバー）
  ├─ [新しいゲーム]            → setup
  └─ [Mölkkout タイブレーカー] → molkkout-setup

molkkout-setup
  └─ [開始]           → molkkout-game

molkkout-game
  └─ [終了]           → result（Mölkkout 結果表示）
```

---

## バリデーションルール

| フィールド | ルール |
|---|---|
| `Player.name` | 1〜10文字、同一ゲーム内で一意（重複はブロック） |
| `Game.players` | 2〜12人 |
| `Turn.pinsKnockedDown` | 0〜12 の整数 |
| `Turn.pinNumber` | `pinsKnockedDown === 1` のとき 1〜12 の整数、それ以外は `null` |
| `Player.score` | 0〜50 の整数（バースト時は 25 にリセット） |
| `Player.consecutiveMisses` | 0〜3（3 で `status → 'eliminated'`） |

---

## スコア計算ルール（`utils/scoring.ts` に実装）

```
calculatePoints(pinsKnockedDown, pinNumber):
  if pinsKnockedDown === 0  → 0（ミス）
  if pinsKnockedDown === 1  → pinNumber の値（1〜12）
  if pinsKnockedDown >= 2   → pinsKnockedDown の値

applyBustRule(currentScore, points):
  newScore = currentScore + points
  if newScore > 50  → 25（バースト）
  else              → newScore

checkWin(score):
  score === 50
```

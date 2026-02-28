// ─────────────────────────────────────────
// Player
// ─────────────────────────────────────────

export type PlayerStatus = 'active' | 'eliminated' | 'winner'

export interface Player {
  /** 一意な ID（セットアップ時に生成） */
  id: string
  /** プレイヤー名（最大12文字、同一ゲーム内で一意） */
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
  /** このターンで獲得した得点（0〜12） */
  points: number
  /** バーストが発生したか（score > 50 → reset to 25） */
  isBust: boolean
  /** ミスだったか（0本） */
  isMiss: boolean
  /**
   * このターン適用前のプレイヤーの状態スナップショット。
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
      points: number
    }

  // ─ アンドゥ ─
  | { type: 'UNDO_TURN' }

  // ─ ゲーム終了後 ─
  | { type: 'RESTART_GAME' }
  | { type: 'NEW_GAME' }

  // ─ Mölkkout ─
  | { type: 'START_MOLKKOUT'; teams: { name: string; playerNames: string[] }[] }
  | {
      type: 'RECORD_MOLKKOUT_TURN'
      points: number
    }

  // ─ 設定 ─
  | { type: 'SET_LANGUAGE'; language: Language }

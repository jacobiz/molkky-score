// ─────────────────────────────────────────
// History（ゲーム結果履歴）
// ─────────────────────────────────────────

export interface HistoryTurnEntry {
  /** ゲーム通算ターン番号（1始まり） */
  turnNumber: number
  /** 投球プレイヤーID */
  playerId: string
  /** 投点（0〜12） */
  points: number
  /** このターン後の累計スコア（バースト後は25） */
  scoreAfter: number
  /** バーストフラグ（score > 50 → 25にリセット） */
  isBust: boolean
  /** ミスフラグ（0本） */
  isMiss: boolean
  /** このターンで脱落したか（3回連続ミス） */
  isEliminated: boolean
}

export interface GameHistoryRecord {
  /** 一意ID（Date.now().toString(36) で生成） */
  id: string
  /** 終了日時（ISO 8601 形式） */
  finishedAt: string
  /** 参加者リスト（投球順） */
  players: { id: string; name: string }[]
  /** 勝者ID（引き分けは null） */
  winnerId: string | null
  /** 終了理由 */
  finishReason: 'normal' | 'timeout'
  /** 総ターン数 */
  totalTurns: number
  /** 全ターンの投球記録 */
  turns: HistoryTurnEntry[]
}

export interface StoredHistory {
  version: 1
  /** 最新順の履歴リスト（先頭が最新、最大20件） */
  records: GameHistoryRecord[]
}

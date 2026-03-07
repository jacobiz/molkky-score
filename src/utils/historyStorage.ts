import type { Game } from '../types/game'
import { applyBustRule } from './scoring'
import type { GameHistoryRecord, StoredHistory } from '../types/history'

export const HISTORY_STORAGE_KEY = 'molkky-score-history'
export const MAX_HISTORY_RECORDS = 20

// ─────────────────────────────────────────
// 読み込み
// ─────────────────────────────────────────

export function loadHistory(): GameHistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!isValidStoredHistory(parsed)) return []
    return parsed.records
  } catch {
    return []
  }
}

function isValidStoredHistory(value: unknown): value is StoredHistory {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return v.version === 1 && Array.isArray(v.records)
}

// ─────────────────────────────────────────
// 追加（最新順・最大20件）
// ─────────────────────────────────────────

export function addRecord(record: GameHistoryRecord): void {
  const records = loadHistory()
  const updated = [record, ...records].slice(0, MAX_HISTORY_RECORDS)
  save(updated)
}

// ─────────────────────────────────────────
// 削除
// ─────────────────────────────────────────

export function removeRecord(id: string): void {
  const records = loadHistory().filter(r => r.id !== id)
  save(records)
}

// ─────────────────────────────────────────
// Game → GameHistoryRecord 変換
// ─────────────────────────────────────────

export function buildHistoryRecord(game: Game): GameHistoryRecord {
  const turns = game.turnHistory.map((turn, index) => {
    const scoreAfter = applyBustRule(turn.playerSnapshotBefore.score, turn.points)
    const isEliminated = turn.isMiss && turn.playerSnapshotBefore.consecutiveMisses === 2

    return {
      turnNumber: index + 1,
      playerId: turn.playerId,
      points: turn.points,
      scoreAfter,
      isBust: turn.isBust,
      isMiss: turn.isMiss,
      isEliminated,
    }
  })

  return {
    id: Date.now().toString(36),
    finishedAt: new Date().toISOString(),
    players: game.players.map(p => ({ id: p.id, name: p.name })),
    winnerId: game.winnerId,
    finishReason: game.finishReason,
    totalTurns: game.totalTurns,
    turns,
  }
}

// ─────────────────────────────────────────
// 内部ユーティリティ
// ─────────────────────────────────────────

function save(records: GameHistoryRecord[]): void {
  try {
    const stored: StoredHistory = { version: 1, records }
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // localStorage 利用不可（プライベートブラウズ等）
  }
}

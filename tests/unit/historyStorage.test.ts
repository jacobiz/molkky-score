import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadHistory,
  addRecord,
  removeRecord,
  buildHistoryRecord,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_RECORDS,
} from '../../src/utils/historyStorage'
import type { GameHistoryRecord } from '../../src/types/history'
import type { Game } from '../../src/types/game'

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

function makeRecord(id: string, finishedAt = '2026-03-06T10:00:00.000Z'): GameHistoryRecord {
  return {
    id,
    finishedAt,
    players: [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }],
    winnerId: 'p1',
    finishReason: 'normal',
    totalTurns: 3,
    turns: [
      { turnNumber: 1, playerId: 'p1', points: 5, scoreAfter: 5, isBust: false, isMiss: false, isEliminated: false },
      { turnNumber: 2, playerId: 'p2', points: 3, scoreAfter: 3, isBust: false, isMiss: false, isEliminated: false },
      { turnNumber: 3, playerId: 'p1', points: 0, scoreAfter: 5, isBust: false, isMiss: true, isEliminated: false },
    ],
  }
}

describe('historyStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  // ─── loadHistory ───────────────────────────────────────
  describe('loadHistory', () => {
    it('should return empty array when no data stored', () => {
      const result = loadHistory()
      expect(result).toEqual([])
    })

    it('should return stored records', () => {
      const record = makeRecord('r1')
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ version: 1, records: [record] }))
      expect(loadHistory()).toEqual([record])
    })

    it('should return empty array when stored data has wrong version', () => {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ version: 99, records: [] }))
      expect(loadHistory()).toEqual([])
    })

    it('should return empty array when stored data is malformed', () => {
      localStorage.setItem(HISTORY_STORAGE_KEY, 'not-json')
      expect(loadHistory()).toEqual([])
    })
  })

  // ─── addRecord ─────────────────────────────────────────
  describe('addRecord', () => {
    it('should add a record to empty history', () => {
      const record = makeRecord('r1')
      addRecord(record)
      expect(loadHistory()).toEqual([record])
    })

    it('should prepend new record (newest first)', () => {
      const older = makeRecord('r1', '2026-03-05T10:00:00.000Z')
      const newer = makeRecord('r2', '2026-03-06T10:00:00.000Z')
      addRecord(older)
      addRecord(newer)
      const result = loadHistory()
      expect(result[0].id).toBe('r2')
      expect(result[1].id).toBe('r1')
    })

    it(`should not exceed ${MAX_HISTORY_RECORDS} records — oldest is removed`, () => {
      for (let i = 0; i < MAX_HISTORY_RECORDS; i++) {
        addRecord(makeRecord(`r${i}`))
      }
      const oldest = makeRecord('oldest')
      // Add one more to push over the limit
      addRecord(makeRecord('newest'))
      addRecord(oldest)
      // Now add one beyond limit
      addRecord(makeRecord('overLimit'))
      const result = loadHistory()
      expect(result.length).toBe(MAX_HISTORY_RECORDS)
      // oldest added before "overLimit" should be dropped
      const ids = result.map(r => r.id)
      expect(ids[0]).toBe('overLimit')
    })
  })

  // ─── removeRecord ──────────────────────────────────────
  describe('removeRecord', () => {
    it('should remove record by id', () => {
      addRecord(makeRecord('r1'))
      addRecord(makeRecord('r2'))
      removeRecord('r1')
      const result = loadHistory()
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('r2')
    })

    it('should do nothing when id not found', () => {
      addRecord(makeRecord('r1'))
      removeRecord('nonexistent')
      expect(loadHistory().length).toBe(1)
    })
  })

  // ─── buildHistoryRecord ────────────────────────────────
  describe('buildHistoryRecord', () => {
    const baseGame: Game = {
      players: [
        { id: 'p1', name: 'Alice', score: 50, consecutiveMisses: 0, status: 'winner' },
        { id: 'p2', name: 'Bob', score: 30, consecutiveMisses: 0, status: 'active' },
      ],
      currentPlayerIndex: 0,
      status: 'finished',
      winnerId: 'p1',
      finishReason: 'normal',
      totalTurns: 2,
      turnHistory: [
        {
          playerId: 'p1',
          points: 10,
          isBust: false,
          isMiss: false,
          playerSnapshotBefore: { id: 'p1', name: 'Alice', score: 40, consecutiveMisses: 0, status: 'active' },
        },
        {
          playerId: 'p2',
          points: 0,
          isBust: false,
          isMiss: true,
          playerSnapshotBefore: { id: 'p2', name: 'Bob', score: 30, consecutiveMisses: 0, status: 'active' },
        },
      ],
    }

    it('should build a valid GameHistoryRecord', () => {
      const record = buildHistoryRecord(baseGame)
      expect(record.winnerId).toBe('p1')
      expect(record.finishReason).toBe('normal')
      expect(record.totalTurns).toBe(2)
      expect(record.players).toEqual([
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ])
    })

    it('should correctly compute scoreAfter for normal turns', () => {
      const record = buildHistoryRecord(baseGame)
      expect(record.turns[0].scoreAfter).toBe(50) // 40 + 10
      expect(record.turns[0].isBust).toBe(false)
      expect(record.turns[0].isEliminated).toBe(false)
    })

    it('should set scoreAfter to 25 on bust', () => {
      const game: Game = {
        ...baseGame,
        turnHistory: [
          {
            playerId: 'p1',
            points: 12,
            isBust: true,
            isMiss: false,
            playerSnapshotBefore: { id: 'p1', name: 'Alice', score: 45, consecutiveMisses: 0, status: 'active' },
          },
        ],
        totalTurns: 1,
      }
      const record = buildHistoryRecord(game)
      expect(record.turns[0].scoreAfter).toBe(25)
      expect(record.turns[0].isBust).toBe(true)
    })

    it('should mark isEliminated when third consecutive miss', () => {
      const game: Game = {
        ...baseGame,
        turnHistory: [
          {
            playerId: 'p2',
            points: 0,
            isBust: false,
            isMiss: true,
            playerSnapshotBefore: { id: 'p2', name: 'Bob', score: 30, consecutiveMisses: 2, status: 'active' },
          },
        ],
        totalTurns: 1,
      }
      const record = buildHistoryRecord(game)
      expect(record.turns[0].isEliminated).toBe(true)
    })

    it('should not mark isEliminated for first/second miss', () => {
      const game: Game = {
        ...baseGame,
        turnHistory: [
          {
            playerId: 'p2',
            points: 0,
            isBust: false,
            isMiss: true,
            playerSnapshotBefore: { id: 'p2', name: 'Bob', score: 30, consecutiveMisses: 1, status: 'active' },
          },
        ],
        totalTurns: 1,
      }
      const record = buildHistoryRecord(game)
      expect(record.turns[0].isEliminated).toBe(false)
    })

    it('should set turnNumber sequentially from 1', () => {
      const record = buildHistoryRecord(baseGame)
      expect(record.turns[0].turnNumber).toBe(1)
      expect(record.turns[1].turnNumber).toBe(2)
    })

    it('should generate a non-empty id', () => {
      const record = buildHistoryRecord(baseGame)
      expect(record.id).toBeTruthy()
    })

    it('should set finishedAt to a valid ISO string', () => {
      const record = buildHistoryRecord(baseGame)
      expect(() => new Date(record.finishedAt)).not.toThrow()
    })
  })
})

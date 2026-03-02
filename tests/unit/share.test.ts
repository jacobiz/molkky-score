import { describe, it, expect } from 'vitest'
import { buildRanking, buildShareText } from '../../src/utils/share'
import type { Player } from '../../src/types/game'
import { ja } from '../../src/i18n/ja'

// ─── helpers ───────────────────────────────────────────────

function makePlayer(overrides: Partial<Player> & { name: string }): Player {
  return {
    id: overrides.name,
    name: overrides.name,
    score: overrides.score ?? 0,
    consecutiveMisses: 0,
    status: overrides.status ?? 'active',
    ...overrides,
  }
}

// ─── buildRanking ────────────────────────────────────────────

describe('buildRanking', () => {
  it('全員 active の場合スコア降順で並ぶ', () => {
    const players = [
      makePlayer({ name: 'Alice', score: 30 }),
      makePlayer({ name: 'Bob', score: 50 }),
      makePlayer({ name: 'Carol', score: 20 }),
    ]
    const ranked = buildRanking(players)
    expect(ranked[0].name).toBe('Bob')
    expect(ranked[1].name).toBe('Alice')
    expect(ranked[2].name).toBe('Carol')
  })

  it('脱落プレイヤーは末尾に移動する', () => {
    const players = [
      makePlayer({ name: 'Alice', score: 30, status: 'active' }),
      makePlayer({ name: 'Bob', score: 0, status: 'eliminated' }),
      makePlayer({ name: 'Carol', score: 20, status: 'active' }),
    ]
    const ranked = buildRanking(players)
    expect(ranked[ranked.length - 1].name).toBe('Bob')
    expect(ranked[0].name).toBe('Alice')
    expect(ranked[1].name).toBe('Carol')
  })

  it('winner は active として扱われスコア降順に含まれる', () => {
    const players = [
      makePlayer({ name: 'Alice', score: 50, status: 'winner' }),
      makePlayer({ name: 'Bob', score: 40, status: 'active' }),
    ]
    const ranked = buildRanking(players)
    expect(ranked[0].name).toBe('Alice')
    expect(ranked[1].name).toBe('Bob')
  })
})

// ─── buildShareText ──────────────────────────────────────────

describe('buildShareText', () => {
  it('sharePrefix が先頭行に含まれる', () => {
    const players = [makePlayer({ name: 'Alice', score: 50, status: 'winner' })]
    const text = buildShareText({ players, totalTurns: 10, t: ja })
    expect(text.startsWith(ja.result.sharePrefix)).toBe(true)
  })

  it('winner に 🏆 が含まれる', () => {
    const players = [
      makePlayer({ name: 'Alice', score: 50, status: 'winner' }),
      makePlayer({ name: 'Bob', score: 30, status: 'active' }),
    ]
    const text = buildShareText({ players, totalTurns: 5, t: ja })
    expect(text).toContain('🏆')
    const lines = text.split('\n')
    expect(lines[1]).toContain('Alice')
    expect(lines[1]).toContain('🏆')
  })

  it('脱落プレイヤーのスコア欄は scoreUnit でなく eliminated 文字列になる', () => {
    const players = [
      makePlayer({ name: 'Alice', score: 50, status: 'winner' }),
      makePlayer({ name: 'Bob', score: 0, status: 'eliminated' }),
    ]
    const text = buildShareText({ players, totalTurns: 8, t: ja })
    expect(text).toContain(ja.result.eliminated)
    // Bob の行は得点数でなく脱落テキスト
    const lines = text.split('\n')
    const bobLine = lines.find(l => l.includes('Bob'))!
    expect(bobLine).toContain(ja.result.eliminated)
    expect(bobLine).not.toContain(ja.result.scoreUnit)
  })

  it('totalTurns の {n} が実際のターン数で置換される', () => {
    const players = [makePlayer({ name: 'Alice', score: 50, status: 'winner' })]
    const text = buildShareText({ players, totalTurns: 42, t: ja })
    expect(text).toContain('42')
    expect(text).not.toContain('{n}')
  })

  it('スコア降順のランキングが正しい順序で出力される', () => {
    const players = [
      makePlayer({ name: 'Alice', score: 20, status: 'active' }),
      makePlayer({ name: 'Bob', score: 50, status: 'winner' }),
      makePlayer({ name: 'Carol', score: 35, status: 'active' }),
    ]
    const text = buildShareText({ players, totalTurns: 15, t: ja })
    const lines = text.split('\n')
    // 1位 Bob, 2位 Carol, 3位 Alice の順
    expect(lines[1]).toContain('Bob')
    expect(lines[2]).toContain('Carol')
    expect(lines[3]).toContain('Alice')
  })
})

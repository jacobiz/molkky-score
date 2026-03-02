import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../../src/reducers/gameReducer'
import type { GameState } from '../../src/types/game'

// ─── helpers ───────────────────────────────────────────────

function startMolkkout(teamCount = 2, playersPerTeam = 1): GameState {
  const teams = Array.from({ length: teamCount }, (_, i) => ({
    name: `Team${i + 1}`,
    playerNames: Array.from({ length: playersPerTeam }, (_, j) => `P${i + 1}-${j + 1}`),
  }))
  return gameReducer(initialState, { type: 'START_MOLKKOUT', teams })
}

function recordMolkkoutTurn(state: GameState, points: number): GameState {
  return gameReducer(state, { type: 'RECORD_MOLKKOUT_TURN', points })
}

/**
 * 現在のチームの全投球を完了させる
 * throwsPerPlayer × playerNames.length 回投球する
 */
function completeCurrentTeam(state: GameState, points: number): GameState {
  const mg = state.molkkoutGame!
  const totalThrows = mg.teams[mg.currentTeamIndex].playerNames.length * mg.throwsPerPlayer
  let s = state
  for (let i = 0; i < totalThrows; i++) {
    if (s.molkkoutGame!.status !== 'active' && s.molkkoutGame!.status !== 'overtime') break
    s = recordMolkkoutTurn(s, points)
  }
  return s
}

// ─── チームローテーション ────────────────────────────────────

describe('RECORD_MOLKKOUT_TURN — チームローテーション', () => {
  it('throwsPerPlayer が正しく設定される（1人/チーム → 3投）', () => {
    const s0 = startMolkkout(2, 1)
    expect(s0.molkkoutGame!.throwsPerPlayer).toBe(3)
  })

  it('throwsPerPlayer が正しく設定される（2人/チーム → 2投）', () => {
    const s0 = startMolkkout(2, 2)
    expect(s0.molkkoutGame!.throwsPerPlayer).toBe(2)
  })

  it('チーム0の全投球完了後、currentTeamIndex が1に進む', () => {
    const s0 = startMolkkout(2)
    expect(s0.molkkoutGame!.currentTeamIndex).toBe(0)
    const s1 = completeCurrentTeam(s0, 5)
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(1)
  })

  it('チーム1の全投球完了後、currentTeamIndex が0に戻る（全チーム完了でラウンド終了）', () => {
    const s0 = startMolkkout(2)
    const s1 = completeCurrentTeam(s0, 5)  // team0 完了
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(1)
    const s2 = completeCurrentTeam(s1, 3)  // team1 完了 → 異なるスコアで finished
    expect(s2.molkkoutGame!.status).toBe('finished')
  })

  it('3チームのローテーション: 0→1→2', () => {
    const s0 = startMolkkout(3)
    expect(s0.molkkoutGame!.currentTeamIndex).toBe(0)
    const s1 = completeCurrentTeam(s0, 5)
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(1)
    const s2 = completeCurrentTeam(s1, 5)
    expect(s2.molkkoutGame!.currentTeamIndex).toBe(2)
  })

  it('得点が totalScore に加算される', () => {
    const s0 = startMolkkout(2)
    const s1 = recordMolkkoutTurn(s0, 7)
    expect(s1.molkkoutGame!.teams[0].totalScore).toBe(7)
    expect(s1.molkkoutGame!.teams[1].totalScore).toBe(0)
  })
})

// ─── overtime 遷移 ──────────────────────────────────────────

describe('RECORD_MOLKKOUT_TURN — overtime 遷移', () => {
  it('全チーム同点でラウンド完了すると status が overtime になる', () => {
    const s0 = startMolkkout(2)
    const s1 = completeCurrentTeam(s0, 5)   // team0: 5点
    const s2 = completeCurrentTeam(s1, 5)   // team1: 5点 → 同点
    expect(s2.molkkoutGame!.status).toBe('overtime')
    expect(s2.molkkoutGame!.winnerId).toBeNull()
  })

  it('overtime 後に単独最高スコアで winner が決まる', () => {
    const s0 = startMolkkout(2)
    const s1 = completeCurrentTeam(s0, 5)   // team0: 5
    const s2 = completeCurrentTeam(s1, 5)   // team1: 5 → overtime
    expect(s2.molkkoutGame!.status).toBe('overtime')

    // overtimeラウンド: team0 が高得点
    const s3 = completeCurrentTeam(s2, 8)   // team0: 13
    const s4 = completeCurrentTeam(s3, 3)   // team1: 8 → team0 勝利
    expect(s4.molkkoutGame!.status).toBe('finished')
    expect(s4.molkkoutGame!.winnerId).toBe(s4.molkkoutGame!.teams[0].id)
  })

  it('overtime が連続する（overtime → overtime → winner）', () => {
    const s0 = startMolkkout(2)
    // ラウンド1: 同点
    const s1 = completeCurrentTeam(s0, 4)
    const s2 = completeCurrentTeam(s1, 4)   // overtime
    expect(s2.molkkoutGame!.status).toBe('overtime')

    // ラウンド2: また同点
    const s3 = completeCurrentTeam(s2, 6)
    const s4 = completeCurrentTeam(s3, 6)   // overtime again
    expect(s4.molkkoutGame!.status).toBe('overtime')

    // ラウンド3: 決着
    const s5 = completeCurrentTeam(s4, 10)
    const s6 = completeCurrentTeam(s5, 7)   // finished
    expect(s6.molkkoutGame!.status).toBe('finished')
  })
})

// ─── 勝者決定 ──────────────────────────────────────────────

describe('RECORD_MOLKKOUT_TURN — 勝者決定', () => {
  it('単独最高スコアのチームが winnerId にセットされる', () => {
    const s0 = startMolkkout(2)
    const s1 = completeCurrentTeam(s0, 10)  // team0: 30 (10 × 3投)
    const s2 = completeCurrentTeam(s1, 3)   // team1: 9 → team0 が勝利
    expect(s2.molkkoutGame!.status).toBe('finished')
    expect(s2.molkkoutGame!.winnerId).toBe(s2.molkkoutGame!.teams[0].id)
  })

  it('勝利後のターン記録は無視される', () => {
    const s0 = startMolkkout(2)
    const s1 = completeCurrentTeam(s0, 10)
    const s2 = completeCurrentTeam(s1, 3)   // finished
    const totalBefore = s2.molkkoutGame!.teams[0].totalScore
    const s3 = recordMolkkoutTurn(s2, 12)   // 無視される
    expect(s3.molkkoutGame!.teams[0].totalScore).toBe(totalBefore)
    expect(s3.molkkoutGame!.status).toBe('finished')
  })
})

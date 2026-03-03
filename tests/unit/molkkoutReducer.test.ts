import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../../src/reducers/gameReducer'
import type { GameState } from '../../src/types/game'

// ─── helpers ───────────────────────────────────────────────

function startMolkkout(teamCount = 2, totalThrows = 3): GameState {
  const teams = Array.from({ length: teamCount }, (_, i) => ({
    name: `Team${i + 1}`,
  }))
  return gameReducer(initialState, { type: 'START_MOLKKOUT', teams, totalThrows })
}

function recordMolkkoutTurn(state: GameState, points: number): GameState {
  return gameReducer(state, { type: 'RECORD_MOLKKOUT_TURN', points })
}

function undoMolkkoutTurn(state: GameState): GameState {
  return gameReducer(state, { type: 'UNDO_MOLKKOUT_TURN' })
}

/**
 * 全チームが1投ずつ行う（1ラウンド完了）
 * pointsPerTeam: 全チーム共通の点数、またはチームごとの点数配列
 * ※ 現在のチームが team0 から始まる前提（ラウンド先頭で呼ぶこと）
 */
function completeRound(state: GameState, pointsPerTeam: number | number[]): GameState {
  const teamCount = state.molkkoutGame!.teams.length
  let s = state
  for (let i = 0; i < teamCount; i++) {
    if (s.molkkoutGame!.status !== 'active' && s.molkkoutGame!.status !== 'overtime') break
    const pts = Array.isArray(pointsPerTeam) ? pointsPerTeam[i] : pointsPerTeam
    s = recordMolkkoutTurn(s, pts)
  }
  return s
}

// ─── START_MOLKKOUT ─────────────────────────────────────────

describe('START_MOLKKOUT — 初期化', () => {
  it('totalThrows が指定した値で初期化される', () => {
    const s = startMolkkout(2, 4)
    expect(s.molkkoutGame!.totalThrows).toBe(4)
  })

  it('currentThrowIndex が 0 で初期化される', () => {
    const s = startMolkkout(2, 3)
    expect(s.molkkoutGame!.currentThrowIndex).toBe(0)
  })

  it('playerNames フィールドが存在しない', () => {
    const s = startMolkkout(2, 3)
    expect((s.molkkoutGame!.teams[0] as any).playerNames).toBeUndefined()
  })
})

// ─── チームローテーション ────────────────────────────────────

describe('RECORD_MOLKKOUT_TURN — チームローテーション', () => {
  it('1投したら次のチームへ切り替わる（ラウンドロビン）', () => {
    const s0 = startMolkkout(2, 3)
    expect(s0.molkkoutGame!.currentTeamIndex).toBe(0)
    const s1 = recordMolkkoutTurn(s0, 5)
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(1)  // 1投で切り替わる
  })

  it('全チームが1投終えるまで throwIndex は変わらない', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = recordMolkkoutTurn(s0, 5)  // team0 投球、ラウンド未完了
    expect(s1.molkkoutGame!.currentThrowIndex).toBe(0)  // まだ 0
  })

  it('全チームが1投ずつ終えると throwIndex が 1 になる', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = completeRound(s0, 5)  // 1ラウンド完了
    expect(s1.molkkoutGame!.currentThrowIndex).toBe(1)
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(0)   // team0 に戻る
  })

  it('3チームのローテーション: 0→1→2→0（throwIndex インクリメント）', () => {
    const s0 = startMolkkout(3, 3)
    const s1 = recordMolkkoutTurn(s0, 5)  // team0 → team1
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(1)
    const s2 = recordMolkkoutTurn(s1, 5)  // team1 → team2
    expect(s2.molkkoutGame!.currentTeamIndex).toBe(2)
    const s3 = recordMolkkoutTurn(s2, 5)  // team2 → team0（ラウンド完了）
    expect(s3.molkkoutGame!.currentTeamIndex).toBe(0)
    expect(s3.molkkoutGame!.currentThrowIndex).toBe(1)  // 1ラウンド済み
  })

  it('得点が totalScore に加算される', () => {
    const s0 = startMolkkout(2)
    const s1 = recordMolkkoutTurn(s0, 7)
    expect(s1.molkkoutGame!.teams[0].totalScore).toBe(7)
    expect(s1.molkkoutGame!.teams[1].totalScore).toBe(0)
  })

  it('MolkkoutTurn に teamIndex と throwIndex が記録される', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = recordMolkkoutTurn(s0, 5)
    const turn = s1.molkkoutGame!.turns[0]
    expect(turn.teamIndex).toBe(0)
    expect(turn.throwIndex).toBe(0)
    expect(turn.prevStatus).toBe('active')
  })

  it('6チーム × 10投のローテーションが正しく機能する（SC-003 境界値）', () => {
    const s0 = startMolkkout(6, 10)
    expect(s0.molkkoutGame!.totalThrows).toBe(10)
    // 全6チームが1投ずつ = 1ラウンド完了
    const s1 = completeRound(s0, 2)
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(0)   // team0 に戻る
    expect(s1.molkkoutGame!.currentThrowIndex).toBe(1)  // 1ラウンド済み
    // もう1ラウンド
    const s2 = completeRound(s1, 2)
    expect(s2.molkkoutGame!.currentThrowIndex).toBe(2)
  })
})

// ─── overtime 遷移 ──────────────────────────────────────────

describe('RECORD_MOLKKOUT_TURN — overtime 遷移', () => {
  it('全チーム同点でラウンド完了すると status が overtime になる', () => {
    const s0 = startMolkkout(2, 1)   // 1ラウンドで完了
    const s1 = completeRound(s0, 5)  // 両チーム5点→同点
    expect(s1.molkkoutGame!.status).toBe('overtime')
    expect(s1.molkkoutGame!.winnerId).toBeNull()
  })

  it('overtime 後に単独最高スコアで winner が決まる', () => {
    const s0 = startMolkkout(2, 1)
    const s1 = completeRound(s0, 5)      // 同点 → overtime
    expect(s1.molkkoutGame!.status).toBe('overtime')
    // overtimeラウンド: team0 が高得点
    const s2 = completeRound(s1, [8, 3])
    expect(s2.molkkoutGame!.status).toBe('finished')
    expect(s2.molkkoutGame!.winnerId).toBe(s2.molkkoutGame!.teams[0].id)
  })

  it('overtime が連続する（overtime → overtime → winner）', () => {
    const s0 = startMolkkout(2, 1)
    // ラウンド1: 同点 → overtime
    const s1 = completeRound(s0, 4)
    expect(s1.molkkoutGame!.status).toBe('overtime')
    // ラウンド2: また同点 → overtime
    const s2 = completeRound(s1, 6)
    expect(s2.molkkoutGame!.status).toBe('overtime')
    // ラウンド3: 決着
    const s3 = completeRound(s2, [10, 7])
    expect(s3.molkkoutGame!.status).toBe('finished')
  })
})

// ─── 勝者決定 ──────────────────────────────────────────────

describe('RECORD_MOLKKOUT_TURN — 勝者決定', () => {
  it('単独最高スコアのチームが winnerId にセットされる', () => {
    const s0 = startMolkkout(2, 1)
    const sEnd = completeRound(s0, [10, 3])  // team0: 10, team1: 3
    expect(sEnd.molkkoutGame!.status).toBe('finished')
    expect(sEnd.molkkoutGame!.winnerId).toBe(sEnd.molkkoutGame!.teams[0].id)
  })

  it('勝利後のターン記録は無視される', () => {
    const s0 = startMolkkout(2, 1)
    const sEnd = completeRound(s0, [10, 3])  // finished
    const totalBefore = sEnd.molkkoutGame!.teams[0].totalScore
    const sExtra = recordMolkkoutTurn(sEnd, 12)  // 無視される
    expect(sExtra.molkkoutGame!.teams[0].totalScore).toBe(totalBefore)
    expect(sExtra.molkkoutGame!.status).toBe('finished')
  })
})

// ─── UNDO_MOLKKOUT_TURN ─────────────────────────────────────

describe('UNDO_MOLKKOUT_TURN', () => {
  it('turns が空のとき state が変化しない', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = undoMolkkoutTurn(s0)
    expect(s1).toBe(s0)
  })

  it('1 投 Undo: スコアが元に戻る', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = recordMolkkoutTurn(s0, 7)
    expect(s1.molkkoutGame!.teams[0].totalScore).toBe(7)
    const s2 = undoMolkkoutTurn(s1)
    expect(s2.molkkoutGame!.teams[0].totalScore).toBe(0)
  })

  it('1 投 Undo: currentTeamIndex が元に戻る', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = recordMolkkoutTurn(s0, 5)  // team0 → team1
    expect(s1.molkkoutGame!.currentTeamIndex).toBe(1)
    const s2 = undoMolkkoutTurn(s1)
    expect(s2.molkkoutGame!.currentTeamIndex).toBe(0)  // team0 に戻る
  })

  it('1 投 Undo: turns から最後のターンが削除される', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = recordMolkkoutTurn(s0, 5)
    expect(s1.molkkoutGame!.turns).toHaveLength(1)
    const s2 = undoMolkkoutTurn(s1)
    expect(s2.molkkoutGame!.turns).toHaveLength(0)
  })

  it('Undo により throwIndex が正しく復元される', () => {
    const s0 = startMolkkout(2, 3)
    const s1 = recordMolkkoutTurn(s0, 5)  // team0 → team1, throwIndex=0
    const s2 = recordMolkkoutTurn(s1, 5)  // team1 → team0, throwIndex=1（ラウンド完了）
    expect(s2.molkkoutGame!.currentThrowIndex).toBe(1)
    const s3 = undoMolkkoutTurn(s2)       // team1 の投を Undo
    expect(s3.molkkoutGame!.currentThrowIndex).toBe(0)  // throwIndex が元に戻る
    expect(s3.molkkoutGame!.currentTeamIndex).toBe(1)   // team1 に戻る
  })

  it('チーム境界またぎの Undo: チーム B の 1 投目 → チーム A の最終投球状態に戻る', () => {
    const s0 = startMolkkout(2, 2)
    // ラウンド1: team0(5点) → team1(5点) → ラウンド完了（team0番に戻る）
    const s1 = recordMolkkoutTurn(s0, 5)  // team0 → team1, throwIndex=0
    const s2 = recordMolkkoutTurn(s1, 5)  // team1 → team0, throwIndex=1（ラウンド1完了）
    expect(s2.molkkoutGame!.currentTeamIndex).toBe(0)
    expect(s2.molkkoutGame!.currentThrowIndex).toBe(1)
    // team1 の投球（ラウンド完了を引き起こした投球）を Undo
    const s3 = undoMolkkoutTurn(s2)
    expect(s3.molkkoutGame!.currentTeamIndex).toBe(1)    // team1 に戻る
    expect(s3.molkkoutGame!.currentThrowIndex).toBe(0)   // throwIndex 0 に戻る
    expect(s3.molkkoutGame!.teams[1].totalScore).toBe(0) // team1 のスコアが取り消される
  })

  it('finished 状態から Undo すると status が active に戻る', () => {
    const s0 = startMolkkout(2, 1)
    // 1ラウンド: team0が高得点 → finished
    const s1 = recordMolkkoutTurn(s0, 10)  // team0
    const s2 = recordMolkkoutTurn(s1, 3)   // team1 → finished
    expect(s2.molkkoutGame!.status).toBe('finished')
    // Undo
    const s3 = undoMolkkoutTurn(s2)
    expect(s3.molkkoutGame!.status).toBe('active')
    expect(s3.molkkoutGame!.winnerId).toBeNull()
    expect(s3.molkkoutGame!.teams[1].totalScore).toBe(0)
  })

  it('overtime 状態から Undo すると status が active に戻る', () => {
    const s0 = startMolkkout(2, 1)
    // 同点でオーバータイム
    const s1 = recordMolkkoutTurn(s0, 5)   // team0
    const s2 = recordMolkkoutTurn(s1, 5)   // team1 → overtime
    expect(s2.molkkoutGame!.status).toBe('overtime')
    // overtime を引き起こした投球（team1）を Undo
    const s3 = undoMolkkoutTurn(s2)
    expect(s3.molkkoutGame!.status).toBe('active')
    expect(s3.molkkoutGame!.teams[1].totalScore).toBe(0)
  })
})

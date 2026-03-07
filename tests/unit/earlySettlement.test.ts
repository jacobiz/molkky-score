import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from '../../src/reducers/gameReducer'
import type { GameState } from '../../src/types/game'
import { startGame, recordTurn } from './helpers'

// ─── helpers ───────────────────────────────────────────────

function startMolkkout(teams: string[], totalThrows = 3): GameState {
  return gameReducer(initialState, {
    type: 'START_MOLKKOUT',
    teams: teams.map(name => ({ name })),
    totalThrows,
  })
}

function recordMolkkoutTurn(state: GameState, points: number): GameState {
  return gameReducer(state, { type: 'RECORD_MOLKKOUT_TURN', points })
}

// ─── EARLY_SETTLEMENT ──────────────────────────────────────

describe('EARLY_SETTLEMENT', () => {
  it('最高スコアのプレイヤーが単独勝者になる', () => {
    let state = startGame(['Alice', 'Bob'])
    state = recordTurn(state, 5)  // Alice: 5
    state = recordTurn(state, 3)  // Bob: 3
    state = gameReducer(state, { type: 'EARLY_SETTLEMENT' })

    expect(state.game!.status).toBe('finished')
    expect(state.game!.finishReason).toBe('timeout')
    expect(state.screen).toBe('result')

    const alice = state.game!.players.find(p => p.name === 'Alice')!
    const bob = state.game!.players.find(p => p.name === 'Bob')!
    expect(alice.status).toBe('winner')
    expect(bob.status).toBe('active')
    expect(state.game!.winnerId).toBe(alice.id)
  })

  it('同スコア首位が複数の場合は引き分け（winnerId が null、全員 winner）', () => {
    let state = startGame(['Alice', 'Bob'])
    state = recordTurn(state, 5)  // Alice: 5
    state = recordTurn(state, 5)  // Bob: 5
    state = gameReducer(state, { type: 'EARLY_SETTLEMENT' })

    expect(state.game!.status).toBe('finished')
    expect(state.game!.finishReason).toBe('timeout')
    expect(state.game!.winnerId).toBeNull()

    const alice = state.game!.players.find(p => p.name === 'Alice')!
    const bob = state.game!.players.find(p => p.name === 'Bob')!
    expect(alice.status).toBe('winner')
    expect(bob.status).toBe('winner')
  })

  it('脱落済みプレイヤーを勝者判定から除外する', () => {
    // Alice を脱落させる（連続3ミス）
    let state = startGame(['Alice', 'Bob', 'Carol'])
    state = recordTurn(state, 10) // Alice: 10
    state = recordTurn(state, 3)  // Bob: 3
    state = recordTurn(state, 3)  // Carol: 3
    // Alice を脱落させる（最初の10点は取ったのでリセット、ここでは別ルートで脱落させる）
    // 簡易：Carol に高スコアを入れ、Bob を脱落させてからテスト
    // より直接的なテスト：eliminatedプレイヤーが存在する状態を作成
    let state2 = startGame(['Alice', 'Bob'])
    // Bob を脱落させる（0点 × 3回）
    state2 = recordTurn(state2, 5)  // Alice: 5
    state2 = recordTurn(state2, 0)  // Bob: miss 1
    state2 = recordTurn(state2, 1)  // Alice: 6
    state2 = recordTurn(state2, 0)  // Bob: miss 2
    state2 = recordTurn(state2, 1)  // Alice: 7
    state2 = recordTurn(state2, 0)  // Bob: miss 3 → eliminated

    expect(state2.game!.players.find(p => p.name === 'Bob')!.status).toBe('eliminated')

    state2 = gameReducer(state2, { type: 'EARLY_SETTLEMENT' })

    const alice = state2.game!.players.find(p => p.name === 'Alice')!
    const bob = state2.game!.players.find(p => p.name === 'Bob')!
    expect(alice.status).toBe('winner')
    expect(bob.status).toBe('eliminated') // 脱落状態が維持される
    expect(state2.game!.winnerId).toBe(alice.id)
  })

  it('全員スコア 0 の場合は no-op（ゲーム状態変化なし）', () => {
    const state = startGame(['Alice', 'Bob'])
    const after = gameReducer(state, { type: 'EARLY_SETTLEMENT' })
    expect(after.game!.status).toBe('active')
    expect(after.screen).toBe('game')
  })

  it('game が null の場合は no-op', () => {
    const after = gameReducer(initialState, { type: 'EARLY_SETTLEMENT' })
    expect(after).toEqual(initialState)
  })

  it('START_GAME の finishReason が normal で初期化される', () => {
    const state = startGame(['Alice', 'Bob'])
    expect(state.game!.finishReason).toBe('normal')
  })
})

// ─── EARLY_MOLKKOUT_SETTLEMENT ─────────────────────────────

describe('EARLY_MOLKKOUT_SETTLEMENT', () => {
  it('最高スコアのチームが単独勝者になる', () => {
    let state = startMolkkout(['TeamA', 'TeamB'])
    state = recordMolkkoutTurn(state, 6)  // TeamA: 6
    state = recordMolkkoutTurn(state, 4)  // TeamB: 4
    state = gameReducer(state, { type: 'EARLY_MOLKKOUT_SETTLEMENT' })

    expect(state.molkkoutGame!.status).toBe('finished')
    expect(state.molkkoutGame!.finishReason).toBe('timeout')

    const teamA = state.molkkoutGame!.teams.find(t => t.name === 'TeamA')!
    expect(state.molkkoutGame!.winnerId).toBe(teamA.id)
  })

  it('同スコアの場合は引き分け（winnerId が null）', () => {
    let state = startMolkkout(['TeamA', 'TeamB'])
    state = recordMolkkoutTurn(state, 5)  // TeamA: 5
    state = recordMolkkoutTurn(state, 5)  // TeamB: 5
    state = gameReducer(state, { type: 'EARLY_MOLKKOUT_SETTLEMENT' })

    expect(state.molkkoutGame!.status).toBe('finished')
    expect(state.molkkoutGame!.finishReason).toBe('timeout')
    expect(state.molkkoutGame!.winnerId).toBeNull()
  })

  it('molkkoutGame が null の場合は no-op', () => {
    const after = gameReducer(initialState, { type: 'EARLY_MOLKKOUT_SETTLEMENT' })
    expect(after).toEqual(initialState)
  })

  it('START_MOLKKOUT の finishReason が normal で初期化される', () => {
    const state = startMolkkout(['TeamA', 'TeamB'])
    expect(state.molkkoutGame!.finishReason).toBe('normal')
  })
})

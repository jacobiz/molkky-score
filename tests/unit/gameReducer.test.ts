import { describe, it, expect } from 'vitest'
import { gameReducer } from '../../src/reducers/gameReducer'
import { startGame, recordTurn } from './helpers'

// ─── START_GAME ────────────────────────────────────────────
describe('START_GAME', () => {
  it('プレイヤーを生成し screen を game に変更する', () => {
    const state = startGame(['Alice', 'Bob'])
    expect(state.screen).toBe('game')
    expect(state.game).not.toBeNull()
    expect(state.game!.players).toHaveLength(2)
    expect(state.game!.players[0].name).toBe('Alice')
    expect(state.game!.players[1].name).toBe('Bob')
  })

  it('全プレイヤーのスコアが 0、ミスが 0、status が active', () => {
    const state = startGame(['Alice', 'Bob'])
    for (const p of state.game!.players) {
      expect(p.score).toBe(0)
      expect(p.consecutiveMisses).toBe(0)
      expect(p.status).toBe('active')
    }
  })

  it('currentPlayerIndex が 0、totalTurns が 0', () => {
    const state = startGame(['Alice', 'Bob'])
    expect(state.game!.currentPlayerIndex).toBe(0)
    expect(state.game!.totalTurns).toBe(0)
  })
})

// ─── RECORD_TURN: 通常スコア ───────────────────────────────
describe('RECORD_TURN - 通常スコア', () => {
  it('得点を加算する', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 12)
    expect(s1.game!.players[0].score).toBe(12)
    expect(s1.game!.currentPlayerIndex).toBe(1)
  })

  it('複数点を加算する', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 3)
    expect(s1.game!.players[0].score).toBe(3)
  })

  it('0点でミスカウンタを増加させスコアは変わらない', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 0)
    expect(s1.game!.players[0].score).toBe(0)
    expect(s1.game!.players[0].consecutiveMisses).toBe(1)
  })

  it('得点ターン後にミスカウンタが 0 にリセットされる', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 0)   // Alice miss → 1
    const s2 = recordTurn(s1, 5)   // Bob
    const s3 = recordTurn(s2, 3)   // Alice 得点
    expect(s3.game!.players[0].consecutiveMisses).toBe(0)
  })

  it('totalTurns がターンごとに増加する', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 5)
    expect(s1.game!.totalTurns).toBe(1)
    const s2 = recordTurn(s1, 3)
    expect(s2.game!.totalTurns).toBe(2)
  })
})

// ─── RECORD_TURN: バースト ─────────────────────────────────
describe('RECORD_TURN - バースト', () => {
  it('50点超でスコアが 25 にリセットされる', () => {
    const s0 = startGame(['Alice', 'Bob'])
    // Alice を 48 点にする
    const s1 = recordTurn(s0, 12)  // 12pt
    const s2 = recordTurn(s1, 5)   // Bob
    const s3 = recordTurn(s2, 12)  // 24pt
    const s4 = recordTurn(s3, 5)   // Bob
    const s5 = recordTurn(s4, 12)  // 36pt
    const s6 = recordTurn(s5, 5)   // Bob
    const s7 = recordTurn(s6, 12)  // 48pt
    const s8 = recordTurn(s7, 5)   // Bob
    const s9 = recordTurn(s8, 5)   // Alice: 48+5=53 → bust → 25
    expect(s9.game!.players[0].score).toBe(25)
    expect(s9.game!.turnHistory.at(-1)!.isBust).toBe(true)
  })
})

// ─── RECORD_TURN: 脱落 ────────────────────────────────────
describe('RECORD_TURN - 脱落', () => {
  it('3回連続ミスでプレイヤーが eliminated になる', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 0)    // Alice miss1
    const s2 = recordTurn(s1, 5)    // Bob
    const s3 = recordTurn(s2, 0)    // Alice miss2
    const s4 = recordTurn(s3, 5)    // Bob
    const s5 = recordTurn(s4, 0)    // Alice miss3 → eliminated
    expect(s5.game!.players[0].status).toBe('eliminated')
  })

  it('脱落プレイヤーはターン順からスキップされる', () => {
    const s0 = startGame(['Alice', 'Bob', 'Carol'])
    // Alice を脱落させる
    let s = s0
    for (let i = 0; i < 3; i++) {
      s = recordTurn(s, 0)   // Alice miss
      s = recordTurn(s, 5)   // Bob
      s = recordTurn(s, 5)   // Carol
    }
    // Alice は eliminated → 次のターンは Bob（index 1）
    expect(s.game!.currentPlayerIndex).toBe(1)
  })

  it('最後の 1 人になったとき自動的に winner になる', () => {
    const s0 = startGame(['Alice', 'Bob'])
    // Bob を脱落させる
    const s1 = recordTurn(s0, 5)   // Alice
    const s2 = recordTurn(s1, 0)   // Bob miss1
    const s3 = recordTurn(s2, 5)   // Alice
    const s4 = recordTurn(s3, 0)   // Bob miss2
    const s5 = recordTurn(s4, 5)   // Alice
    const s6 = recordTurn(s5, 0)   // Bob miss3 → eliminated → Alice wins
    expect(s6.game!.status).toBe('finished')
    expect(s6.game!.players[0].status).toBe('winner')
    expect(s6.screen).toBe('result')
  })
})

// ─── RECORD_TURN: 勝利 ────────────────────────────────────
describe('RECORD_TURN - 勝利', () => {
  it('ちょうど 50 点で勝者が確定し screen が result になる', () => {
    const s0 = startGame(['Alice', 'Bob'])
    // Alice を 47 点にする
    const s1 = recordTurn(s0, 12)  // 12
    const s2 = recordTurn(s1, 5)   // Bob
    const s3 = recordTurn(s2, 12)  // 24
    const s4 = recordTurn(s3, 5)   // Bob
    const s5 = recordTurn(s4, 12)  // 36
    const s6 = recordTurn(s5, 5)   // Bob
    const s7 = recordTurn(s6, 11)  // 47
    const s8 = recordTurn(s7, 5)   // Bob
    const s9 = recordTurn(s8, 3)   // Alice: 47+3=50 → win
    expect(s9.game!.status).toBe('finished')
    expect(s9.game!.players[0].status).toBe('winner')
    expect(s9.screen).toBe('result')
  })
})

// ─── UNDO_TURN ────────────────────────────────────────────
describe('UNDO_TURN', () => {
  it('直前のターンを取り消しスコアを復元する', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 12)  // Alice 12pt
    const s2 = gameReducer(s1, { type: 'UNDO_TURN' })
    expect(s2.game!.players[0].score).toBe(0)
    expect(s2.game!.currentPlayerIndex).toBe(0)
    expect(s2.game!.totalTurns).toBe(0)
  })

  it('バーストを取り消しバースト前のスコアに戻す', () => {
    const s0 = startGame(['Alice', 'Bob'])
    // Alice を 48 点に設定してバーストさせる
    const s1 = recordTurn(s0, 12)
    const s2 = recordTurn(s1, 5)
    const s3 = recordTurn(s2, 12)
    const s4 = recordTurn(s3, 5)
    const s5 = recordTurn(s4, 12)
    const s6 = recordTurn(s5, 5)
    const s7 = recordTurn(s6, 12)  // Alice 48pt
    const s8 = recordTurn(s7, 5)   // Bob
    const s9 = recordTurn(s8, 5)   // Alice: 48+5=53 → bust → 25
    expect(s9.game!.players[0].score).toBe(25)
    const s10 = gameReducer(s9, { type: 'UNDO_TURN' })
    expect(s10.game!.players[0].score).toBe(48)
  })

  it('脱落を取り消しプレイヤーを active に戻す', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = recordTurn(s0, 0)
    const s2 = recordTurn(s1, 5)
    const s3 = recordTurn(s2, 0)
    const s4 = recordTurn(s3, 5)
    const s5 = recordTurn(s4, 0)  // Alice eliminated
    expect(s5.game!.players[0].status).toBe('eliminated')
    const s6 = gameReducer(s5, { type: 'UNDO_TURN' })
    expect(s6.game!.players[0].status).toBe('active')
    expect(s6.game!.players[0].consecutiveMisses).toBe(2)
  })

  it('turnHistory が空のとき何も変わらない', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = gameReducer(s0, { type: 'UNDO_TURN' })
    expect(s1).toEqual(s0)
  })
})

// ─── NEW_GAME ─────────────────────────────────────────────
describe('NEW_GAME', () => {
  it('game を null にして screen を setup に変更する', () => {
    const s0 = startGame(['Alice', 'Bob'])
    const s1 = gameReducer(s0, { type: 'NEW_GAME' })
    expect(s1.game).toBeNull()
    expect(s1.screen).toBe('setup')
  })
})

// ─── SET_LANGUAGE ─────────────────────────────────────────
describe('SET_LANGUAGE', () => {
  it('言語設定を更新する', () => {
    const s0 = startGame(['Alice'])
    const s1 = gameReducer(s0, { type: 'SET_LANGUAGE', language: 'en' })
    expect(s1.settings.language).toBe('en')
    const s2 = gameReducer(s1, { type: 'SET_LANGUAGE', language: 'ja' })
    expect(s2.settings.language).toBe('ja')
  })
})

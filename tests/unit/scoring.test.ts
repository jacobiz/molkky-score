import { describe, it, expect } from 'vitest'
import {
  applyBustRule,
  checkWin,
  incrementMisses,
} from '../../src/utils/scoring'

describe('applyBustRule', () => {
  it('合計が50点以下のときそのまま返す', () => {
    expect(applyBustRule(30, 10)).toBe(40)
    expect(applyBustRule(0, 50)).toBe(50)
    expect(applyBustRule(48, 2)).toBe(50)
  })

  it('合計がちょうど50点のとき50を返す（バーストなし）', () => {
    expect(applyBustRule(47, 3)).toBe(50)
  })

  it('合計が50点を超えたとき25にリセットする（バースト）', () => {
    expect(applyBustRule(48, 5)).toBe(25)
    expect(applyBustRule(49, 12)).toBe(25)
    expect(applyBustRule(25, 26)).toBe(25)
  })
})

describe('checkWin', () => {
  it('スコアが50のとき true を返す', () => {
    expect(checkWin(50)).toBe(true)
  })

  it('スコアが50未満のとき false を返す', () => {
    expect(checkWin(49)).toBe(false)
    expect(checkWin(0)).toBe(false)
    expect(checkWin(25)).toBe(false)
  })
})

describe('incrementMisses', () => {
  it('ミス数が2以下のとき数を1増加させる', () => {
    expect(incrementMisses(0)).toBe(1)
    expect(incrementMisses(1)).toBe(2)
  })

  it('ミス数が2のとき3回目のミスで "eliminated" を返す', () => {
    expect(incrementMisses(2)).toBe('eliminated')
  })
})

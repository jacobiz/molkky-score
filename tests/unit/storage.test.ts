import { describe, test, expect, beforeEach } from 'vitest'
import { loadState } from '../../src/utils/storage'

beforeEach(() => localStorage.clear())

describe('loadState — バージョン不一致', () => {
  test('バージョン不一致は null を返す', () => {
    localStorage.setItem('molkky-score-v2', JSON.stringify({ version: 1 }))
    expect(loadState()).toBeNull()
  })

  test('バージョン不一致後に localStorage から削除される', () => {
    localStorage.setItem('molkky-score-v2', JSON.stringify({ version: 1 }))
    loadState()
    expect(localStorage.getItem('molkky-score-v2')).toBeNull()
  })
})

describe('loadState — 破損データ', () => {
  test('settings が文字列のデータは null を返す', () => {
    localStorage.setItem('molkky-score-v2', JSON.stringify({ version: 3, settings: 'INVALID' }))
    expect(loadState()).toBeNull()
  })

  test('settings が文字列のデータは localStorage から削除される', () => {
    localStorage.setItem('molkky-score-v2', JSON.stringify({ version: 3, settings: 'BAD' }))
    loadState()
    expect(localStorage.getItem('molkky-score-v2')).toBeNull()
  })

  test('不正な JSON は null を返す', () => {
    localStorage.setItem('molkky-score-v2', '{invalid json}')
    expect(loadState()).toBeNull()
  })
})

describe('loadState — 正常データ', () => {
  test('正常データは正しく復元できる', () => {
    const data = {
      version: 3,
      game: null,
      molkkoutGame: null,
      settings: { language: 'ja' },
    }
    localStorage.setItem('molkky-score-v2', JSON.stringify(data))
    const result = loadState()
    expect(result).not.toBeNull()
    expect(result!.settings.language).toBe('ja')
    expect(result!.game).toBeNull()
    expect(result!.molkkoutGame).toBeNull()
  })

  test('データがない場合は null を返す', () => {
    expect(loadState()).toBeNull()
  })
})

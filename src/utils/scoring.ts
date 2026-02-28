/**
 * スコア計算ピュア関数
 * - 副作用なし
 * - 全関数は tests/unit/scoring.test.ts で TDD 済み
 */

/**
 * バーストルールを適用する
 * - 合計が50以下: そのまま返す
 * - 合計が50超: 25にリセット
 */
export function applyBustRule(currentScore: number, points: number): number {
  const newScore = currentScore + points
  return newScore > 50 ? 25 : newScore
}

/**
 * 勝利判定: スコアがちょうど50点のとき true
 */
export function checkWin(score: number): boolean {
  return score === 50
}

/**
 * 連続ミスカウンタを1増加させる
 * - 2回目までは数値を返す
 * - 3回目（count === 2）は 'eliminated' を返す
 */
export function incrementMisses(count: number): number | 'eliminated' {
  if (count >= 2) return 'eliminated'
  return count + 1
}

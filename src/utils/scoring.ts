/**
 * スコア計算ピュア関数
 * - 副作用なし
 * - 全関数は tests/unit/scoring.test.ts で TDD 済み
 */

/**
 * 投球結果から得点を計算する
 * - 0本: 0点
 * - 1本: ピン番号の値
 * - 2本以上: 倒した本数（ピン番号の合計ではない）
 */
export function calculatePoints(
  pinsKnockedDown: number,
  pinNumber: number | null,
): number {
  if (pinsKnockedDown === 0) return 0
  if (pinsKnockedDown === 1) return pinNumber ?? 0
  return pinsKnockedDown
}

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

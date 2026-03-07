import { useMemo } from 'react'
import { useTranslation } from '../../utils/i18n'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import type { GameHistoryRecord } from '../../types/history'

interface ScoreSheetModalProps {
  record: GameHistoryRecord
  onClose: () => void
}

export function ScoreSheetModal({ record, onClose }: ScoreSheetModalProps) {
  const { t } = useTranslation()

  useEscapeKey(onClose)

  const winnerName = record.winnerId
    ? record.players.find(p => p.id === record.winnerId)?.name ?? ''
    : t.history.drawLabel

  // ラウンドごとに各プレイヤーの投球データをマッピング
  // ラウンド = 各プレイヤーがそれぞれ何投目か（プレイヤーの投球順ではなく投球回数で集約）
  type CellData = { points: number; scoreAfter: number; isBust: boolean; isMiss: boolean; isEliminated: boolean }

  const { roundMap, roundNumbers, eliminatedByRound } = useMemo(() => {
    const roundMap = new Map<number, Map<string, CellData>>()
    const playerThrowCounts = new Map<string, number>()

    for (const turn of record.turns) {
      const count = (playerThrowCounts.get(turn.playerId) ?? 0) + 1
      playerThrowCounts.set(turn.playerId, count)
      if (!roundMap.has(count)) roundMap.set(count, new Map())
      roundMap.get(count)!.set(turn.playerId, {
        points: turn.points,
        scoreAfter: turn.scoreAfter,
        isBust: turn.isBust,
        isMiss: turn.isMiss,
        isEliminated: turn.isEliminated,
      })
    }

    const roundNumbers = Array.from(roundMap.keys()).sort((a, b) => a - b)

    // 脱落済みプレイヤーを事前計算（playerId → 脱落したroundNum）
    const eliminatedByRound = new Map<string, number>()
    for (const roundNum of roundNumbers) {
      for (const [playerId, entry] of roundMap.get(roundNum)!.entries()) {
        if (entry.isEliminated && !eliminatedByRound.has(playerId)) {
          eliminatedByRound.set(playerId, roundNum)
        }
      }
    }

    return { roundMap, roundNumbers, eliminatedByRound }
  }, [record.id])

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[85dvh] flex flex-col scoresheet-print-area safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0 border-b">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-gray-900">{t.history.scoreSheet}</h2>
            <p className="text-xs text-gray-500">
              🏆 {winnerName}
              {record.finishReason === 'timeout' && (
                <span className="ml-2 text-amber-600">{t.history.timeoutBadge}</span>
              )}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(record.finishedAt).toLocaleString()} &nbsp;·&nbsp; {record.players.map(p => p.name).join(' → ')}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <button
              onClick={() => window.print()}
              className="print-hide text-gray-400 hover:text-gray-600 text-sm px-2 py-1 border border-gray-200 rounded-lg"
              aria-label={t.history.printButton}
            >
              🖨
            </button>
            <button
              onClick={onClose}
              className="print-hide text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label={t.history.closeButton}
            >
              ✕
            </button>
          </div>
        </div>

        {/* テーブル（横スクロール対応） */}
        <div className="overflow-auto flex-1">
          <table className="text-xs border-collapse min-w-full">
            <thead>
              <tr className="bg-gray-50 sticky top-0 z-10">
                <th className="text-left px-3 py-2 text-gray-500 font-medium border-b border-r border-gray-100 min-w-[3rem]">
                  {t.history.rounds}
                </th>
                {record.players.map(p => (
                  <th
                    key={p.id}
                    className="px-3 py-2 text-gray-700 font-semibold border-b border-gray-100 min-w-[5rem] text-center"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roundNumbers.map(roundNum => {
                const roundData = roundMap.get(roundNum)!
                return (
                  <tr key={roundNum} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-gray-400 font-mono border-r border-gray-100 text-center">
                      {roundNum}
                    </td>
                    {record.players.map(p => {
                      const entry = roundData.get(p.id)
                      const alreadyEliminated = (eliminatedByRound.get(p.id) ?? Infinity) < roundNum

                      if (!entry) {
                        // このターンに投球なし（脱落済み or ラウンド未到達）
                        return (
                          <td key={p.id} className="px-3 py-2 text-center text-gray-300">
                            —
                          </td>
                        )
                      }

                      if (alreadyEliminated) {
                        // 既に脱落済みのプレイヤー
                        return (
                          <td key={p.id} className="px-3 py-2 text-center text-gray-300 line-through">
                            —
                          </td>
                        )
                      }

                      return (
                        <td
                          key={p.id}
                          className={[
                            'px-3 py-2 text-center',
                            entry.isBust ? 'bg-red-50 text-red-600' : '',
                            entry.isEliminated ? 'bg-orange-50 text-orange-600' : '',
                            entry.scoreAfter === 50 ? 'bg-green-100' : '',
                          ].join(' ')}
                        >
                          <span className="block font-semibold">
                            {entry.isMiss ? '✕' : `+${entry.points}`}
                          </span>
                          <span className={['block text-gray-500', entry.isBust ? 'text-red-400' : '', entry.scoreAfter === 50 ? 'text-green-700 font-bold' : ''].join(' ')}>
                            {entry.scoreAfter}
                          </span>
                          {entry.isBust && (
                            <span className="block text-red-400 text-[10px]">BUST</span>
                          )}
                          {entry.isEliminated && (
                            <span className="block text-orange-500 text-[10px]">OUT</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

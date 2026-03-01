import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useTranslation } from '../utils/i18n'
import { buildShareText, shareResult } from '../utils/share'
import { ScreenHeader } from './ui/ScreenHeader'
import { Toast } from './ui/Toast'
import type { Game, Player } from '../types/game'

function buildRanking(players: Player[]): Player[] {
  const active = players
    .filter(p => p.status !== 'eliminated')
    .sort((a, b) => b.score - a.score)
  const eliminated = players.filter(p => p.status === 'eliminated')
  return [...active, ...eliminated]
}

function ResultScreenContent({ game }: { game: Game }) {
  const { dispatch } = useGame()
  const { t } = useTranslation()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const winner = game.players.find(p => p.status === 'winner')
  const ranked = buildRanking(game.players)

  async function handleShare() {
    const text = buildShareText({ players: game.players, totalTurns: game.totalTurns, t })
    await shareResult(text, () => setToastMessage(t.common.copied))
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <ScreenHeader
        title={t.result.title}
        requireConfirm={false}
        onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
      />
      {/* Winner summary */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 text-center">
        {winner && (
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {t.result.winner.replace('{name}', winner.name)}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {t.result.totalTurns.replace('{n}', String(game.totalTurns))}
        </p>
      </header>

      {/* Rankings */}
      <div className="flex-1 flex flex-col divide-y divide-gray-100 overflow-y-auto">
        {ranked.map((player, i) => {
          const rank = i + 1
          const suffix = t.result.rankSuffix(rank)
          const isWinner = player.status === 'winner'
          const isEliminated = player.status === 'eliminated'

          return (
            <div
              key={player.id}
              className={`
                flex items-center gap-4 px-4 py-4 bg-white
                ${isWinner ? 'bg-green-50' : ''}
              `}
            >
              <span className="text-lg font-bold text-gray-400 w-10 text-center">
                {rank}{suffix}
              </span>
              <span
                className={`
                  flex-1 text-base font-medium
                  ${isEliminated ? 'line-through text-gray-400' : 'text-gray-900'}
                  ${isWinner ? 'text-green-700 font-bold' : ''}
                `}
              >
                {player.name}
              </span>
              <span className={`text-base ${isEliminated ? 'text-gray-400' : 'text-gray-700 font-semibold'}`}>
                {isEliminated ? t.result.eliminated : `${player.score}pt`}
              </span>
              {isWinner && <span className="text-xl">🏆</span>}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-2xl border border-gray-300 text-gray-700 font-semibold active:bg-gray-50"
        >
          📤 {t.result.share}
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'REMATCH_SETUP' })}
            className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-semibold active:bg-green-600"
          >
            🔄 {t.result.playAgain}
          </button>
          <button
            onClick={() => dispatch({ type: 'NEW_GAME' })}
            className="flex-1 py-3 rounded-2xl bg-blue-500 text-white font-semibold active:bg-blue-600"
          >
            {t.result.newGame}
          </button>
        </div>
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', screen: 'molkkout-setup' })}
          className="w-full py-3 rounded-2xl bg-purple-500 text-white font-semibold active:bg-purple-600"
        >
          {t.molkkout.title}
        </button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}

export function ResultScreen() {
  const { state } = useGame()
  const game = state.game
  if (!game) return null
  return <ResultScreenContent game={game} />
}

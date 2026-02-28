import { useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { useTranslation } from '../../utils/i18n'
import { calculatePoints, applyBustRule } from '../../utils/scoring'
import { Toast } from '../ui/Toast'
import { PinInput } from './PinInput'
import { ScoreBoard } from './ScoreBoard'
import type { Game } from '../../types/game'

function GameScreenContent({ game }: { game: Game }) {
  const { dispatch } = useGame()
  const { t } = useTranslation()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentPlayer = game.players[game.currentPlayerIndex]
  const canUndo = game.turnHistory.length > 0

  const handleCloseToast = useCallback(() => setToastMessage(null), [])

  function handlePinSubmit(pinsKnockedDown: number, pinNumber: number | null) {
    const player = game.players[game.currentPlayerIndex]

    // Determine notification based on what will happen
    if (pinsKnockedDown === 0 && player.consecutiveMisses >= 2) {
      setToastMessage(t.game.eliminatedMessage.replace('{name}', player.name))
    } else if (pinsKnockedDown > 0) {
      const points = calculatePoints(pinsKnockedDown, pinNumber)
      const newScore = applyBustRule(player.score, points)
      if (newScore === 25 && player.score + points > 50) {
        setToastMessage(t.game.bustMessage)
      }
    }

    dispatch({ type: 'RECORD_TURN', pinsKnockedDown, pinNumber })
  }

  function handleUndo() {
    setToastMessage(null)
    dispatch({ type: 'UNDO_TURN' })
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50 md:flex-row">
      {/* Top / Left: header + ScoreBoard */}
      <div className="flex-1 flex flex-col md:overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <p className="text-base font-semibold text-gray-900 truncate">
            {t.game.currentTurn.replace('{name}', currentPlayer?.name ?? '')}
          </p>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="ml-3 shrink-0 px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 disabled:opacity-30 active:bg-gray-100"
          >
            {t.game.undo}
          </button>
        </header>

        <ScoreBoard
          players={game.players}
          currentPlayerIndex={game.currentPlayerIndex}
        />
      </div>

      {/* Bottom / Right: PinInput */}
      <div className="bg-white border-t border-gray-200 md:border-t-0 md:border-l md:w-80 md:flex md:flex-col md:justify-center">
        {/* Re-mount PinInput on each new turn to reset step state */}
        <PinInput key={game.totalTurns} onSubmit={handlePinSubmit} />
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={handleCloseToast} />
      )}
    </div>
  )
}

export function GameScreen() {
  const { state } = useGame()
  const game = state.game
  if (!game) return null
  return <GameScreenContent game={game} />
}

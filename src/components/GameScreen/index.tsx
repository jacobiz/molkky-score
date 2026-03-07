import { useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { useTranslation } from '../../utils/i18n'
import { isBustThrow } from '../../utils/scoring'
import { ScreenHeader } from '../ui/ScreenHeader'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Toast } from '../ui/Toast'
import { NumberInput } from '../ui/NumberInput'
import { ScoreBoard } from './ScoreBoard'
import { PinSetupGuideModal } from '../ui/PinSetupGuideModal'
import type { Game } from '../../types/game'

function GameScreenContent({ game }: { game: Game }) {
  const { dispatch } = useGame()
  const { t } = useTranslation()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showEarlySettlementConfirm, setShowEarlySettlementConfirm] = useState(false)
  const [showPinGuide, setShowPinGuide] = useState(false)

  const currentPlayer = game.players[game.currentPlayerIndex]
  const canUndo = game.turnHistory.length > 0
  const throwCount = game.turnHistory.filter(turn => turn.playerId === currentPlayer?.id).length + 1
  const canEarlySettle = game.players.some(p => p.status === 'active' && p.score > 0)

  const handleCloseToast = useCallback(() => setToastMessage(null), [])

  function handlePinSubmit(points: number) {
    const player = game.players[game.currentPlayerIndex]

    // Determine notification based on what will happen
    if (points === 0 && player.consecutiveMisses >= 2) {
      setToastMessage(t.game.eliminatedMessage.replace('{name}', player.name))
    } else if (isBustThrow(player.score, points)) {
      setToastMessage(t.game.bustMessage)
    }

    dispatch({ type: 'RECORD_TURN', points })
  }

  function handleUndo() {
    setToastMessage(null)
    dispatch({ type: 'UNDO_TURN' })
  }

  function handleEarlySettlementConfirm() {
    setShowEarlySettlementConfirm(false)
    dispatch({ type: 'EARLY_SETTLEMENT' })
  }

  return (
    <div className="h-dvh flex flex-col safe-x">
      <ScreenHeader
        title={t.game.title}
        requireConfirm={true}
        onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
        rightContent={
          <button
            onClick={() => setShowPinGuide(true)}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label={t.pinGuide.buttonAriaLabel}
          >
            🎯
          </button>
        }
      />
      {/* Top / Left: header + ScoreBoard */}
      <div className="flex-1 min-h-0 flex flex-col bg-gray-50 md:flex-row">
      <div className="flex-none flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex flex-col min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">
              {t.game.currentTurn.replace('{name}', currentPlayer?.name ?? '')}
            </p>
            <p className="text-sm text-gray-500">
              {t.game.throwCount(throwCount)}
            </p>
          </div>
          <div className="flex gap-2 ml-3 shrink-0">
            {canEarlySettle && (
              <button
                onClick={() => setShowEarlySettlementConfirm(true)}
                className="px-3 py-2 rounded-xl border border-amber-400 text-sm text-amber-700 bg-amber-50 active:bg-amber-100"
              >
                ⏱ {t.game.earlySettlement}
              </button>
            )}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 disabled:opacity-30 active:bg-gray-100"
            >
              ↩️ {t.game.undo}
            </button>
          </div>
        </header>

        <div className="h-[272px] overflow-y-auto md:h-auto md:flex-1 md:min-h-0">
          <ScoreBoard
            players={game.players}
            currentPlayerIndex={game.currentPlayerIndex}
          />
        </div>
      </div>

      {/* Bottom / Right: NumberInput */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-2/5 md:justify-center safe-bottom">
        {/* Re-mount on each new turn to reset step state */}
        <NumberInput key={game.totalTurns} onSubmit={handlePinSubmit} variant="game" />
      </div>

        {/* Toast notification */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={handleCloseToast} />
        )}
      </div>

      {showEarlySettlementConfirm && (
        <ConfirmDialog
          message={t.game.earlySettlementConfirm}
          confirmLabel={t.game.earlySettlement}
          cancelLabel={t.common.cancel}
          onConfirm={handleEarlySettlementConfirm}
          onCancel={() => setShowEarlySettlementConfirm(false)}
        />
      )}
      {showPinGuide && (
        <PinSetupGuideModal mode="regular" onClose={() => setShowPinGuide(false)} />
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

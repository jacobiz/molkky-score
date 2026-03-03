import { useState } from 'react'
import { useGame } from '../../context/GameContext'
import { useTranslation } from '../../utils/i18n'
import { ScreenHeader } from '../ui/ScreenHeader'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PinSetupGuideModal } from '../ui/PinSetupGuideModal'
import { MolkkoutInput } from './MolkkoutInput'

export function MolkkoutScreen() {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()
  const [showEarlySettlementConfirm, setShowEarlySettlementConfirm] = useState(false)
  const [showPinGuide, setShowPinGuide] = useState(false)

  const mg = state.molkkoutGame
  if (!mg) return null

  const currentTeam = mg.teams[mg.currentTeamIndex]
  const canEarlySettle = mg.teams.some(tm => tm.totalScore > 0) && mg.status !== 'finished'

  function handleSubmit(points: number) {
    dispatch({ type: 'RECORD_MOLKKOUT_TURN', points })
  }

  function handleUndo() {
    dispatch({ type: 'UNDO_MOLKKOUT_TURN' })
  }

  function handleEarlySettlementConfirm() {
    setShowEarlySettlementConfirm(false)
    dispatch({ type: 'EARLY_MOLKKOUT_SETTLEMENT' })
  }

  if (mg.status === 'finished') {
    const maxScore = Math.max(...mg.teams.map(tm => tm.totalScore))
    const topTeams = mg.teams.filter(tm => tm.totalScore === maxScore)
    const isDraw = mg.winnerId === null
    const winner = isDraw ? null : mg.teams.find(tm => tm.id === mg.winnerId)
    return (
      <div className="min-h-dvh flex flex-col bg-gray-50">
        <ScreenHeader
          title={t.molkkout.title}
          requireConfirm={false}
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center">
            {mg.finishReason === 'timeout' && (
              <p className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-3 py-1 inline-block mb-3">
                {t.result.timeoutBadge}
              </p>
            )}
            <p className="text-5xl mb-4">{isDraw ? '🤝' : '🏆'}</p>
            <p className="text-2xl font-bold text-gray-900">
              {isDraw
                ? `${t.result.drawWinners}: ${topTeams.map(tm => tm.name).join(' · ')}`
                : winner ? t.molkkout.winner.replace('{team}', winner.name) : ''}
            </p>
          </div>
          <div className="w-full max-w-sm flex flex-col gap-3">
            {mg.teams
              .slice()
              .sort((a, b) => b.totalScore - a.totalScore)
              .map(team => (
                <div
                  key={team.id}
                  className={`
                    flex justify-between items-center px-4 py-3 rounded-xl bg-white border
                    ${team.id === mg.winnerId ? 'border-green-400 bg-green-50' : 'border-gray-200'}
                  `}
                >
                  <span className="font-medium text-gray-900">{team.name}</span>
                  <span className="text-lg font-bold text-gray-700">
                    {team.totalScore}{t.result.scoreUnit}
                  </span>
                </div>
              ))}
          </div>
          <button
            onClick={() => dispatch({ type: 'UNDO_MOLKKOUT_TURN' })}
            disabled={mg.turns.length === 0}
            className="text-sm text-gray-500 underline disabled:opacity-30"
          >
            {t.game.undo}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col">
      <ScreenHeader
        title={t.molkkout.title}
        requireConfirm={mg.status === 'active' || mg.status === 'overtime'}
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
      <div className="flex-1 min-h-0 flex flex-col bg-gray-50 md:flex-row">
      {/* Top / Left: teams & scores */}
      <div className="shrink-0 flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          {mg.status === 'overtime' && (
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-3 py-1 text-center mb-2">
              {t.molkkout.overtime}
            </p>
          )}
          <p className="text-base font-semibold text-gray-900 text-center">
            {t.molkkout.teamTurnLabel.replace('{team}', currentTeam.name)}
          </p>
          <p className="text-xs text-gray-400 text-center mt-0.5">
            {t.molkkout.throwProgress(mg.currentThrowIndex + 1, mg.totalThrows)}
          </p>
        </header>

        <div className="overflow-y-auto max-h-80 md:max-h-none md:flex-1">
          <div className="flex flex-col divide-y divide-gray-100">
            {mg.teams.map((team, i) => (
              <div
                key={team.id}
                className={`
                  flex items-center justify-between px-4 py-4
                  ${i === mg.currentTeamIndex ? 'bg-blue-50' : 'bg-white'}
                `}
              >
                <div>
                  {i === mg.currentTeamIndex && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  )}
                  <span className="text-base font-medium text-gray-900">{team.name}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {team.totalScore}{t.result.scoreUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom / Right: MolkkoutInput + Undo + Early Settlement */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-gray-200 md:flex-none md:border-t-0 md:border-l md:w-80 md:justify-center">
        <MolkkoutInput
          key={mg.turns.length}
          onSubmit={handleSubmit}
        />
        <div className="px-4 pb-4 flex flex-col gap-2">
          <button
            onClick={handleUndo}
            disabled={mg.turns.length === 0}
            className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 disabled:opacity-30 active:bg-gray-50"
          >
            ↩ {t.game.undo}
          </button>
          {canEarlySettle && (
            <button
              onClick={() => setShowEarlySettlementConfirm(true)}
              className="w-full py-2 rounded-xl border border-amber-400 text-sm text-amber-700 bg-amber-50 active:bg-amber-100"
            >
              ⏱ {t.game.earlySettlement}
            </button>
          )}
        </div>
      </div>
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
        <PinSetupGuideModal mode="molkkout" onClose={() => setShowPinGuide(false)} />
      )}
    </div>
  )
}

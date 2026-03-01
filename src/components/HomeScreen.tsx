import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useTranslation } from '../utils/i18n'
import { ConfirmDialog } from './ui/ConfirmDialog'

export function HomeScreen() {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)

  const hasActiveGame = state.game !== null

  function handleNewGame() {
    if (hasActiveGame) {
      setShowConfirm(true)
    } else {
      dispatch({ type: 'NEW_GAME' })
    }
  }

  function handleConfirmNewGame() {
    setShowConfirm(false)
    dispatch({ type: 'NEW_GAME' })
  }

  function handleResumeGame() {
    dispatch({ type: 'NAVIGATE', screen: 'game' })
  }

  function handleToggleLanguage() {
    const next = state.settings.language === 'ja' ? 'en' : 'ja'
    dispatch({ type: 'SET_LANGUAGE', language: next })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {t.home.title}
          </h1>
        </div>

        {/* Resume game (shown only when game exists) */}
        {hasActiveGame && (
          <button
            onClick={handleResumeGame}
            className="w-full py-4 rounded-2xl bg-green-500 text-white text-lg font-semibold shadow-sm active:bg-green-600"
          >
            ▶️ {t.home.resumeGame}
          </button>
        )}

        {/* New game */}
        <button
          onClick={handleNewGame}
          className="w-full py-4 rounded-2xl bg-blue-500 text-white text-lg font-semibold shadow-sm active:bg-blue-600"
        >
          ▶️ {t.home.newGame}
        </button>

        {/* Language toggle */}
        <button
          onClick={handleToggleLanguage}
          className="self-center px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-600 bg-white"
        >
          {state.settings.language === 'ja' ? 'English' : '日本語'}
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        v{__APP_VERSION__} · MIT License · © 2026 jacobiz
      </p>

      {/* Confirm dialog */}
      {showConfirm && (
        <ConfirmDialog
          message={t.home.overwriteConfirm}
          confirmLabel={t.home.confirmYes}
          cancelLabel={t.home.confirmNo}
          onConfirm={handleConfirmNewGame}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}

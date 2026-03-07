import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useTranslation } from '../utils/i18n'
import { LanguageSelector } from './ui/LanguageSelector'
import { ScreenHeader } from './ui/ScreenHeader'

export function SetupScreen() {
  const { state, dispatch } = useGame()
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<string[]>(state.rematchPlayers ?? [])

  function handleAdd() {
    const name = inputValue.trim()
    if (players.length >= 10) {
      setError(t.setup.errorMaxPlayers)
      return
    }
    if (name.length > 12) {
      setError(t.setup.errorMaxLength)
      return
    }
    if (players.includes(name)) {
      setError(t.setup.errorDuplicate)
      return
    }
    setPlayers(prev => [...prev, name])
    setInputValue('')
    setError(null)
  }

  function handleRemove(index: number) {
    setPlayers(prev => prev.filter((_, i) => i !== index))
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= players.length) return
    setPlayers(prev => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function handleShuffle() {
    setPlayers(prev => {
      const r = [...prev]
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[r[i], r[j]] = [r[j], r[i]]
      }
      return r
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  function handleStartGame() {
    if (players.length < 2) {
      setError(t.setup.errorMinPlayers)
      return
    }
    dispatch({ type: 'START_GAME', playerNames: players })
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col safe-x">
      <ScreenHeader
        title={t.setup.title}
        requireConfirm={true}
        onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
        rightContent={
          <LanguageSelector
            current={state.settings.language}
            onSelect={(lang) => dispatch({ type: 'SET_LANGUAGE', language: lang })}
          />
        }
      />

      <div className="flex-1 flex flex-col gap-4 p-4">
        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.setup.namePlaceholder}
            maxLength={12}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAdd}
            disabled={inputValue.trim() === ''}
            className="px-5 py-3 rounded-xl bg-blue-500 text-white font-semibold disabled:opacity-40 active:bg-blue-600"
          >
            {t.setup.addPlayer}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 px-1">{error}</p>
        )}

        {/* Player list */}
        {players.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-gray-500">{t.setup.orderHint}</p>
              {players.length >= 2 && (
                <button
                  onClick={handleShuffle}
                  className="text-sm px-3 py-1 rounded-lg border border-gray-200 text-gray-600 bg-white active:bg-gray-100"
                >
                  🔀 {t.setup.shuffle}
                </button>
              )}
            </div>
            {players.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-3"
              >
                <span className="text-sm text-gray-400 w-5 text-center">{i + 1}</span>
                <span className="flex-1 text-base font-medium text-gray-800">{name}</span>
                {/* Move buttons */}
                <button
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30"
                  aria-label={t.setup.moveUp}
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(i, 1)}
                  disabled={i === players.length - 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30"
                  aria-label={t.setup.moveDown}
                >
                  ↓
                </button>
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(i)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-400 active:bg-red-100"
                  aria-label={t.setup.removePlayer}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start game button */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleStartGame}
          disabled={players.length < 2}
          className="w-full py-4 rounded-2xl bg-green-500 text-white text-lg font-semibold shadow-sm disabled:opacity-40 active:bg-green-600"
        >
          ▶️ {t.setup.startGame}
        </button>
        {players.length < 2 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            {t.setup.errorMinPlayers}
          </p>
        )}
      </div>
    </div>
  )
}

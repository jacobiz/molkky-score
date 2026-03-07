import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useTranslation } from '../utils/i18n'
import { ScreenHeader } from './ui/ScreenHeader'
import { Toast } from './ui/Toast'

export function MolkkoutSetupScreen() {
  const { dispatch } = useGame()
  const { t } = useTranslation()
  const [teams, setTeams] = useState<string[]>(['', ''])
  const [totalThrows, setTotalThrows] = useState(3)
  const [toast, setToast] = useState<string | null>(null)

  function addTeam() {
    setTeams(prev => [...prev, ''])
  }

  function updateTeamName(idx: number, name: string) {
    setTeams(prev => prev.map((v, i) => (i === idx ? name : v)))
  }

  function handleStart() {
    const names = teams.map(name => name.trim())

    if (names.some(n => n === '')) {
      setToast(t.molkkout.errorTeamRequired)
      return
    }

    const unique = new Set(names)
    if (unique.size !== names.length) {
      setToast(t.molkkout.errorDuplicateTeam)
      return
    }

    dispatch({
      type: 'START_MOLKKOUT',
      teams: names.map(name => ({ name })),
      totalThrows,
    })
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <ScreenHeader
        title={t.molkkout.title}
        requireConfirm={false}
        onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
      />

      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        <p className="text-sm text-gray-500 px-1">{t.molkkout.pinSetupGuide}</p>

        {/* チーム名入力 */}
        {teams.map((name, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-200 p-4"
          >
            <input
              type="text"
              value={name}
              onChange={e => updateTeamName(idx, e.target.value)}
              placeholder={t.molkkout.teamNamePlaceholder(idx + 1)}
              maxLength={12}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        {teams.length < 6 && (
          <button
            onClick={addTeam}
            className="py-3 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm"
          >
            + {t.molkkout.addTeam}
          </button>
        )}

        {/* 投球数ステッパー */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">{t.molkkout.totalThrowsLabel}</p>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setTotalThrows(v => v - 1)}
              disabled={totalThrows <= 1}
              className="w-12 h-12 rounded-full border border-gray-300 text-2xl font-semibold text-gray-700 disabled:opacity-30 active:bg-gray-100"
              aria-label={t.molkkout.decreaseThrows}
            >
              −
            </button>
            <span className="text-4xl font-bold text-gray-900 w-12 text-center">
              {totalThrows}
            </span>
            <button
              onClick={() => setTotalThrows(v => v + 1)}
              disabled={totalThrows >= 10}
              className="w-12 h-12 rounded-full border border-gray-300 text-2xl font-semibold text-gray-700 disabled:opacity-30 active:bg-gray-100"
              aria-label={t.molkkout.increaseThrows}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-purple-500 text-white text-lg font-semibold active:bg-purple-600"
        >
          {t.molkkout.start}
        </button>
      </div>

      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

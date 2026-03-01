import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useTranslation } from '../utils/i18n'
import { ScreenHeader } from './ui/ScreenHeader'

interface Team {
  name: string
  playerNames: string[]
}

export function MolkkoutSetupScreen() {
  const { dispatch } = useGame()
  const { t } = useTranslation()
  const [teams, setTeams] = useState<Team[]>([
    { name: '', playerNames: [''] },
    { name: '', playerNames: [''] },
  ])
  const [error, setError] = useState<string | null>(null)

  function addTeam() {
    setTeams(prev => [...prev, { name: '', playerNames: [''] }])
  }

  function updateTeamName(teamIdx: number, name: string) {
    setTeams(prev =>
      prev.map((t, i) => (i === teamIdx ? { ...t, name } : t)),
    )
  }

  function updatePlayerName(teamIdx: number, playerIdx: number, name: string) {
    setTeams(prev =>
      prev.map((t, i) =>
        i === teamIdx
          ? {
              ...t,
              playerNames: t.playerNames.map((p, j) =>
                j === playerIdx ? name : p,
              ),
            }
          : t,
      ),
    )
  }

  function addPlayer(teamIdx: number) {
    setTeams(prev =>
      prev.map((t, i) =>
        i === teamIdx ? { ...t, playerNames: [...t.playerNames, ''] } : t,
      ),
    )
  }

  function handleStart() {
    const valid = teams.every(
      team =>
        team.name.trim() !== '' &&
        team.playerNames.every(p => p.trim() !== ''),
    )
    if (!valid) {
      setError('チーム名とプレイヤー名をすべて入力してください')
      return
    }
    dispatch({
      type: 'START_MOLKKOUT',
      teams: teams.map(t => ({
        name: t.name.trim(),
        playerNames: t.playerNames.map(p => p.trim()),
      })),
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
        {teams.map((team, teamIdx) => (
          <div
            key={teamIdx}
            className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3"
          >
            <input
              type="text"
              value={team.name}
              onChange={e => updateTeamName(teamIdx, e.target.value)}
              placeholder={`チーム ${teamIdx + 1} の名前`}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {team.playerNames.map((pName, playerIdx) => (
              <input
                key={playerIdx}
                type="text"
                value={pName}
                onChange={e => updatePlayerName(teamIdx, playerIdx, e.target.value)}
                placeholder={`プレイヤー ${playerIdx + 1}`}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ))}
            {team.playerNames.length < 5 && (
              <button
                onClick={() => addPlayer(teamIdx)}
                className="text-sm text-blue-500 text-center py-1"
              >
                + プレイヤーを追加
              </button>
            )}
          </div>
        ))}

        {teams.length < 6 && (
          <button
            onClick={addTeam}
            className="py-3 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm"
          >
            + チームを追加
          </button>
        )}

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl bg-purple-500 text-white text-lg font-semibold active:bg-purple-600"
        >
          {t.molkkout.start}
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { useTranslation } from '../utils/i18n'
import { loadHistory, removeRecord } from '../utils/historyStorage'
import { ScreenHeader } from './ui/ScreenHeader'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { ScoreSheetModal } from './ui/ScoreSheetModal'
import type { GameHistoryRecord } from '../types/history'

export function HistoryScreen() {
  const { dispatch } = useGame()
  const { t } = useTranslation()
  const [records, setRecords] = useState<GameHistoryRecord[]>(() => loadHistory())
  const [selectedRecord, setSelectedRecord] = useState<GameHistoryRecord | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  function handleDelete(id: string) {
    setDeleteTargetId(id)
  }

  function confirmDelete() {
    if (!deleteTargetId) return
    removeRecord(deleteTargetId)
    setRecords(loadHistory())
    setDeleteTargetId(null)
  }

  function formatDate(iso: string): string {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <ScreenHeader
        title={t.history.title}
        onGoHome={() => dispatch({ type: 'NAVIGATE', screen: 'home' })}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {records.length === 0 ? (
          <p className="text-center text-gray-400 mt-12 text-sm">{t.history.empty}</p>
        ) : (
          records.map(record => (
            <HistoryCard
              key={record.id}
              record={record}
              formattedDate={formatDate(record.finishedAt)}
              onOpen={() => setSelectedRecord(record)}
              onDelete={() => handleDelete(record.id)}
            />
          ))
        )}
      </div>

      {selectedRecord && (
        <ScoreSheetModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {deleteTargetId && (
        <ConfirmDialog
          message={t.history.deleteConfirm}
          confirmLabel={t.history.deleteButton}
          cancelLabel={t.common.cancel}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

interface HistoryCardProps {
  record: GameHistoryRecord
  formattedDate: string
  onOpen: () => void
  onDelete: () => void
}

function HistoryCard({ record, formattedDate, onOpen, onDelete }: HistoryCardProps) {
  const { t } = useTranslation()

  const winnerName = record.winnerId
    ? record.players.find(p => p.id === record.winnerId)?.name ?? ''
    : t.history.drawLabel

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        className="w-full text-left px-4 pt-4 pb-3 active:bg-gray-50"
        onClick={onOpen}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs text-gray-400">{formattedDate}</span>
            <span className="text-sm font-semibold text-gray-900 truncate">
              🏆 {winnerName}
            </span>
            <span className="text-xs text-gray-500">
              {record.players.map(p => p.name).join(' · ')}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-gray-500">
              {record.totalTurns} {t.history.turns}
            </span>
            {record.finishReason === 'timeout' && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {t.history.timeoutBadge}
              </span>
            )}
          </div>
        </div>
      </button>
      <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-600 py-1"
          aria-label={t.history.deleteButton}
        >
          {t.history.deleteButton}
        </button>
      </div>
    </div>
  )
}

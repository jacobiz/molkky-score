import { useEffect } from 'react'
import { useTranslation } from '../../utils/i18n'

interface PinSetupGuideModalProps {
  mode: 'regular' | 'molkkout'
  onClose: () => void
}

export function PinSetupGuideModal({ mode, onClose }: PinSetupGuideModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80dvh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{t.pinGuide.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label={t.pinGuide.closeButton}
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          {mode === 'regular' ? (
            <RegularLayout />
          ) : (
            <MolkkoutLayout />
          )}
        </div>
      </div>
    </div>
  )
}

function RegularLayout() {
  const { t } = useTranslation()
  return (
    <>
      <h3 className="font-semibold text-gray-800">{t.pinGuide.regular.heading}</h3>
      <p className="text-xs text-gray-500">{t.pinGuide.regular.layoutCaption}</p>

      {/* 三角配置図 */}
      <div className="font-mono text-sm text-center flex flex-col gap-1 py-2 select-none">
        {/* Row 4（後列） */}
        <div className="flex justify-center gap-2">
          <Pin n={7} />
          <Pin n={9} />
          <Pin n={8} />
        </div>
        {/* Row 3 */}
        <div className="flex justify-center gap-2">
          <Pin n={5} />
          <Pin n={11} />
          <Pin n={12} />
          <Pin n={6} />
        </div>
        {/* Row 2 */}
        <div className="flex justify-center gap-2">
          <Pin n={3} />
          <Pin n={10} />
          <Pin n={4} />
        </div>
        {/* Row 1（前列） */}
        <div className="flex justify-center gap-2">
          <Pin n={1} />
          <Pin n={2} />
        </div>
        {/* 投球ライン */}
        <div className="mt-3 border-t-2 border-dashed border-gray-400 relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-xs text-gray-500">
            ▽
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center">{t.pinGuide.regular.distanceLabel}</p>
    </>
  )
}

function MolkkoutLayout() {
  const { t } = useTranslation()
  return (
    <>
      <h3 className="font-semibold text-gray-800">{t.pinGuide.molkkout.heading}</h3>
      <p className="text-xs text-gray-500">{t.pinGuide.molkkout.layoutCaption}</p>

      {/* 直線配置図 */}
      <div className="flex items-center justify-center gap-1 py-2 flex-wrap select-none">
        <Pin n={6} />
        <span className="text-gray-400 text-sm">—</span>
        <Pin n={4} />
        <span className="text-gray-400 text-sm">—</span>
        <Pin n={12} />
        <span className="text-gray-400 text-sm">—</span>
        <Pin n={10} />
        <span className="text-gray-400 text-sm">—</span>
        <Pin n={8} />
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
        <p>{t.pinGuide.molkkout.distanceLabel}</p>
        <p>{t.pinGuide.molkkout.spacingLabel}</p>
        <p className="text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-xs font-medium">
          ⚠ {t.pinGuide.molkkout.resetNote}
        </p>
      </div>
    </>
  )
}

function Pin({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-sm font-bold text-amber-900">
      {n}
    </span>
  )
}

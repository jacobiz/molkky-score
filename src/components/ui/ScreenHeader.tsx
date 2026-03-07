import { useState } from "react"
import { useTranslation } from "../../utils/i18n"
import { ConfirmDialog } from "./ConfirmDialog"

interface ScreenHeaderProps {
  title: string
  requireConfirm?: boolean
  onGoHome: () => void
  rightContent?: React.ReactNode
}

export function ScreenHeader({
  title,
  requireConfirm = false,
  onGoHome,
  rightContent,
}: ScreenHeaderProps) {
  const { t } = useTranslation()
  const [showConfirm, setShowConfirm] = useState(false)

  function handleHomeClick() {
    if (requireConfirm) {
      setShowConfirm(true)
    } else {
      onGoHome()
    }
  }

  return (
    <>
      <header className="relative bg-white border-b flex items-end px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] shrink-0">
        <button
          onClick={handleHomeClick}
          className="text-sm text-blue-600 font-medium py-1 pr-2 shrink-0 z-10"
        >
          ← {t.common.backToHome}
        </button>
        <span className="absolute inset-x-0 bottom-3 text-xl font-semibold text-gray-800 text-center pointer-events-none px-20 truncate">
          {title}
        </span>
        {rightContent && <div className="ml-auto shrink-0 z-10">{rightContent}</div>}
      </header>
      {showConfirm && (
        <ConfirmDialog
          message={t.common.backToHomeConfirm}
          confirmLabel={t.common.backToHome}
          cancelLabel={t.common.cancel}
          onConfirm={onGoHome}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}

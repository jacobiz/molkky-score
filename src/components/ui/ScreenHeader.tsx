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
      <header className="bg-white border-b flex items-end gap-2 px-4 pb-3 shrink-0 safe-top">
        <button
          onClick={handleHomeClick}
          className="text-sm text-blue-600 font-medium py-1 pr-2 shrink-0"
        >
          ← {t.common.backToHome}
        </button>
        <span className="flex-1 text-base font-semibold text-gray-800 truncate text-center">
          {title}
        </span>
        {rightContent && <div className="shrink-0">{rightContent}</div>}
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

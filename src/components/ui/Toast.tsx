import { useEffect } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({ message, duration = 2500, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg">
      {message}
    </div>
  )
}

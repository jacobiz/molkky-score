import { useGame } from '../context/GameContext'
import { ja } from '../i18n/ja'
import { en } from '../i18n/en'
import { fi } from '../i18n/fi'
import type { Language } from '../types/game'
import type { Messages } from '../i18n/ja'

export function getLangFromUrl(): Language | null {
  const lang = new URLSearchParams(window.location.search).get('lang')
  if (lang === 'ja' || lang === 'en' || lang === 'fi') return lang
  return null
}

export function detectLocale(): Language {
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  if (lang === 'fi') return 'fi'
  if (lang === 'en') return 'en'
  return 'ja'
}

const messages: Record<Language, Messages> = { ja, en, fi }

export function useTranslation() {
  const { state } = useGame()
  return { t: messages[state.settings.language] }
}

import { useGame } from '../context/GameContext'
import { ja } from '../i18n/ja'
import { en } from '../i18n/en'
import { fi } from '../i18n/fi'
import type { Language } from '../types/game'

export function detectLocale(): Language {
  const lang = navigator.language?.slice(0, 2).toLowerCase()
  if (lang === 'fi') return 'fi'
  if (lang === 'en') return 'en'
  return 'ja'
}

export function useTranslation() {
  const { state } = useGame()
  const lang = state.settings.language
  const t = lang === 'fi' ? fi : lang === 'en' ? en : ja
  return { t }
}

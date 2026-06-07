'use client'

import React, {createContext, useContext, useState, useCallback} from 'react'
import en from './translations/en.json'
import fr from './translations/fr.json'

const dictionaries: Record<string, Record<string, string>> = {en, fr}

type Lang = 'en' | 'fr'

type I18nCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider({children}: {children: React.ReactNode}) {
  // Native app defaults to French.
  const [lang, setLangState] = useState<Lang>('fr')

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('grm-lang', l)
    } catch {}
  }, [])

  // hydrate from storage once
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('grm-lang') as Lang | null
      if (saved && (saved === 'en' || saved === 'fr')) setLangState(saved)
    } catch {}
  }, [])

  const t = useCallback(
    (key: string) => {
      return dictionaries[lang]?.[key] ?? dictionaries['en']?.[key] ?? key
    },
    [lang],
  )

  return <Ctx.Provider value={{lang, setLang, t}}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

'use client'

import {useI18n} from '@/lib/i18n'

export function LangToggle() {
  const {lang, setLang} = useI18n()
  return (
    <div className="flex overflow-hidden rounded-full border border-[#dedede] bg-white text-xs font-semibold">
      <button
        onClick={() => setLang('fr')}
        className={`px-3 py-1.5 ${lang === 'fr' ? 'bg-[#24c38b] text-white' : 'text-[#707070]'}`}
      >
        FR
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 ${lang === 'en' ? 'bg-[#24c38b] text-white' : 'text-[#707070]'}`}
      >
        EN
      </button>
    </div>
  )
}

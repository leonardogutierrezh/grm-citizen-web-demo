'use client'

import React, {createContext, useContext, useState, useCallback} from 'react'

// In-app stack navigator — keeps everything inside the phone frame so the
// experience mimics the native app (no browser URL changes between screens).
export type Screen =
  | 'home'
  | 'allIssues'
  | 'issueDetail'
  | 'create'
  | 'profile'

type Entry = {screen: Screen; params?: Record<string, unknown>}

type NavCtx = {
  stack: Entry[]
  current: Entry
  tab: 'home' | 'profile'
  navigate: (screen: Screen, params?: Record<string, unknown>) => void
  goBack: () => void
  resetTo: (screen: Screen, params?: Record<string, unknown>) => void
  setTab: (tab: 'home' | 'profile') => void
}

const Ctx = createContext<NavCtx | null>(null)

export function NavProvider({children}: {children: React.ReactNode}) {
  const [stack, setStack] = useState<Entry[]>([{screen: 'home'}])
  const [tab, setTabState] = useState<'home' | 'profile'>('home')

  const navigate = useCallback(
    (screen: Screen, params?: Record<string, unknown>) => {
      setStack(prev => [...prev, {screen, params}])
    },
    [],
  )

  const goBack = useCallback(() => {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const resetTo = useCallback(
    (screen: Screen, params?: Record<string, unknown>) => {
      setStack([{screen, params}])
    },
    [],
  )

  const setTab = useCallback((newTab: 'home' | 'profile') => {
    setTabState(newTab)
    setStack([{screen: newTab === 'home' ? 'home' : 'profile'}])
  }, [])

  const current = stack[stack.length - 1]

  return (
    <Ctx.Provider
      value={{stack, current, tab, navigate, goBack, resetTo, setTab}}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useNav() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}

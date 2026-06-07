'use client'

import React, {createContext, useContext, useEffect, useState} from 'react'
import {
  Session,
  clearSession,
  getSession,
  storeSession,
} from '@/lib/api'

type AuthCtx = {
  session: Session | null
  ready: boolean
  signIn: (s: Session) => void
  signOut: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSession(getSession())
    setReady(true)
  }, [])

  const signIn = (s: Session) => {
    storeSession(s)
    setSession(s)
  }

  const signOut = () => {
    clearSession()
    setSession(null)
  }

  return (
    <Ctx.Provider value={{session, ready, signIn, signOut}}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

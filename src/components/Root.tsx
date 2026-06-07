'use client'

import {useState} from 'react'
import {PhoneFrame} from '@/components/PhoneFrame'
import {App} from '@/components/App'
import {Login} from '@/screens/Login'
import {SignUp} from '@/screens/SignUp'
import {AuthProvider, useAuth} from '@/context/AuthContext'
import {NavProvider} from '@/context/NavContext'
import {I18nProvider} from '@/lib/i18n'
import {Spinner} from '@/components/ui'

function AuthGate() {
  const {session, ready} = useAuth()
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login')

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8fafc]">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return authScreen === 'login' ? (
      <Login onGoSignUp={() => setAuthScreen('signup')} />
    ) : (
      <SignUp onBack={() => setAuthScreen('login')} />
    )
  }

  return (
    <NavProvider>
      <App />
    </NavProvider>
  )
}

export function Root() {
  return (
    <I18nProvider>
      <AuthProvider>
        <PhoneFrame>
          <AuthGate />
        </PhoneFrame>
      </AuthProvider>
    </I18nProvider>
  )
}

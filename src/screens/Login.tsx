'use client'

import {useState} from 'react'
import {Eye, EyeOff} from 'lucide-react'
import {CustomButton, Field, FullScreenLoader} from '@/components/ui'
import {login, Session} from '@/lib/api'
import {useAuth} from '@/context/AuthContext'
import {useI18n} from '@/lib/i18n'
import {LangToggle} from '@/components/LangToggle'

export function Login({onGoSignUp}: {onGoSignUp: () => void}) {
  const {t} = useI18n()
  const {signIn} = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [secure, setSecure] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onLogin = async () => {
    if (!username || !password) {
      setError(t('this_field_is_required'))
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await login(username, password)
      if (res?.error || !res?.token) {
        setError(res?.error || t('technical_difficulty_error'))
        setLoading(false)
        return
      }
      signIn(res as Session)
    } catch (e: unknown) {
      const err = e as {data?: {error?: string}}
      setError(err?.data?.error || t('technical_difficulty_error'))
      setLoading(false)
    }
  }

  return (
    <div className="relative h-full overflow-y-auto bg-[#f8fafc] no-scrollbar">
      {loading && <FullScreenLoader />}
      <div className="absolute right-4 top-3 z-10">
        <LangToggle />
      </div>
      <div className="px-7 pb-10 pt-14">
        <div className="mb-12 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/eadl-logo.svg" alt="EADL" className="h-24 w-auto" />
          <p className="mt-2 px-2 text-center text-[19px] font-bold leading-6 text-[#707070]">
            {t('welcome_login')}
          </p>
        </div>

        <Field
          label={t('username')}
          value={username}
          onChange={setUsername}
          placeholder={t('enter_your_username')}
        />
        <Field
          label={t('password')}
          value={password}
          onChange={setPassword}
          placeholder={t('enter_your_password')}
          type={secure ? 'password' : 'text'}
          error={error}
          rightIcon={
            <button onClick={() => setSecure(s => !s)} className="text-[#24c38b]">
              {secure ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />

        <CustomButton label={t('login')} onClick={onLogin} className="mt-2" />

        <p className="mt-6 text-center text-[15px] text-[#707070]">
          {t('dont_have_account')}{' '}
          <button onClick={onGoSignUp} className="font-semibold text-[#24c38b]">
            {t('create_account')}
          </button>
        </p>
      </div>
    </div>
  )
}

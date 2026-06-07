'use client'

import {useState} from 'react'
import {Eye, EyeOff, CheckCircle2} from 'lucide-react'
import {CustomButton, Field, FullScreenLoader, Header} from '@/components/ui'
import {login, register, Session} from '@/lib/api'
import {useAuth} from '@/context/AuthContext'
import {useI18n} from '@/lib/i18n'
import {emailRegex, passwordRegex} from '@/lib/format'

type Errors = Record<string, string>

export function SignUp({onBack}: {onBack: () => void}) {
  const {t} = useI18n()
  const {signIn} = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  })
  const [secure, setSecure] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [success, setSuccess] = useState(false)

  const set = (k: string) => (v: string) => setForm(f => ({...f, [k]: v}))

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.first_name) e.first_name = t('this_field_is_required')
    if (!form.last_name) e.last_name = t('this_field_is_required')
    if (!form.username) e.username = t('this_field_is_required')
    if (form.email && !emailRegex.test(form.email)) e.email = 'Invalid email'
    if (!form.phone_number) e.phone_number = t('this_field_is_required')
    if (!passwordRegex.test(form.password)) e.password = t('password_hint')
    if (form.password !== form.confirmPassword)
      e.confirmPassword = t('password_hint')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        phone_number: form.phone_number,
        password: form.password,
        confirm_password: form.confirmPassword,
      }
      const res = await register(payload)
      if (res?.errors) {
        const e: Errors = {}
        Object.keys(res.errors).forEach(k => {
          e[k] = res.errors![k].join('. ')
        })
        setErrors(e)
        setLoading(false)
        return
      }
      const username = res?.data?.username || form.username
      const loginRes = await login(username, form.password)
      setLoading(false)
      if (loginRes?.token) {
        setSuccess(true)
        setTimeout(() => signIn(loginRes as Session), 1400)
      } else {
        onBack()
      }
    } catch {
      setLoading(false)
      setErrors({username: t('technical_difficulty_error')})
    }
  }

  if (success) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-white px-8 text-center animate-fade-in">
        <CheckCircle2 size={90} color="#24c38b" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/eadl-logo.svg" alt="EADL" className="h-20 w-auto" />
        <p className="text-xl font-bold text-[#707070]">
          {t('account_create_success')}
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-[#f8fafc]">
      {loading && <FullScreenLoader />}
      <Header title={t('create_account')} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-7 py-5 no-scrollbar">
        <Field
          label={t('first_name')}
          value={form.first_name}
          onChange={set('first_name')}
          placeholder={t('enter_your_full_name')}
          error={errors.first_name}
        />
        <Field
          label={t('last_name')}
          value={form.last_name}
          onChange={set('last_name')}
          placeholder={t('enter_your_last_name')}
          error={errors.last_name}
        />
        <Field
          label={t('username')}
          value={form.username}
          onChange={set('username')}
          placeholder={t('enter_your_username')}
          error={errors.username}
        />
        <Field
          label={t('email')}
          optional={t('optional')}
          value={form.email}
          onChange={set('email')}
          placeholder={t('enter_your_email')}
          error={errors.email}
        />
        <Field
          label={t('phone_number')}
          value={form.phone_number}
          onChange={set('phone_number')}
          placeholder={t('enter_your_phone_number')}
          type="tel"
          error={errors.phone_number}
        />
        <Field
          label={t('password')}
          value={form.password}
          onChange={set('password')}
          placeholder={t('enter_your_password')}
          type={secure ? 'password' : 'text'}
          error={errors.password}
          rightIcon={
            <button onClick={() => setSecure(s => !s)} className="text-[#24c38b]">
              {secure ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />
        <Field
          label={t('confirm_password')}
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          placeholder={t('confirm_your_password')}
          type={secure ? 'password' : 'text'}
          error={errors.confirmPassword}
        />
        <p className="mb-2 text-xs text-[#707070]">{t('password_hint')}</p>
        <CustomButton label={t('sign_up')} onClick={onSubmit} className="mx-0 mt-2" />
      </div>
    </div>
  )
}

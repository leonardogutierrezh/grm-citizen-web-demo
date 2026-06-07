'use client'

import {useEffect, useState} from 'react'
import {LogOut, User} from 'lucide-react'
import {Spinner, CustomButton} from '@/components/ui'
import {getCitizenDetail} from '@/lib/api'
import {useAuth} from '@/context/AuthContext'
import {useI18n} from '@/lib/i18n'
import {LangToggle} from '@/components/LangToggle'

type Profile = {
  user?: {
    first_name?: string
    last_name?: string
    username?: string
    email?: string
    phone_number?: string
  }
  first_name?: string
  last_name?: string
  username?: string
  email?: string
  phone_number?: string
  gender?: string
  age_group?: {name?: string} | string
  [k: string]: unknown
}

function Row({label, value}: {label: string; value?: string}) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between border-b border-[#f1f1f1] py-3 last:border-0">
      <span className="text-base text-[#707070]">{label}</span>
      <span className="text-base font-medium text-[#1f2937]">{value}</span>
    </div>
  )
}

export function Profile() {
  const {t} = useI18n()
  const {signOut, session} = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = (await getCitizenDetail()) as Profile
        setProfile(data)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const u = profile?.user || profile || {}
  const name =
    [u.first_name, u.last_name].filter(Boolean).join(' ') ||
    (session?.username as string) ||
    ''
  const ageGroup =
    typeof profile?.age_group === 'object'
      ? profile?.age_group?.name
      : (profile?.age_group as string)

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#f8fafc] no-scrollbar">
      <div className="flex items-center justify-between px-5 pt-4">
        <h1 className="text-2xl font-bold text-[#1f2937]">{t('complete_profile').split(' ')[0] === 'Complete' ? 'Profile' : 'Profil'}</h1>
        <LangToggle />
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="px-5 py-4">
          <div className="mb-5 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e1f2eb]">
              <User size={40} color="#24c38b" />
            </div>
            <p className="mt-3 text-xl font-bold text-[#1f2937]">{name}</p>
            {u.username && (
              <p className="text-sm text-[#707070]">@{u.username}</p>
            )}
          </div>

          <div className="rounded-xl border border-[#dedede] bg-white px-4">
            <Row label={t('first_name')} value={u.first_name} />
            <Row label={t('last_name')} value={u.last_name} />
            <Row label={t('email')} value={u.email} />
            <Row label={t('phone_number')} value={u.phone_number} />
            <Row label={t('gender')} value={profile?.gender} />
            <Row label={t('age_group')} value={ageGroup} />
          </div>

          <CustomButton
            label={t('logout')}
            onClick={signOut}
            icon={<LogOut size={18} />}
            backgroundColor="#ef6a78"
            className="mx-0 mt-6"
          />
        </div>
      )}
    </div>
  )
}

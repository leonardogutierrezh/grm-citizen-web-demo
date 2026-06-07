'use client'

import {Frown, PlusCircle} from 'lucide-react'
import {CustomButton, Spinner} from '@/components/ui'
import {GrievanceCard} from '@/components/GrievanceCard'
import {useIssueList} from '@/hooks/useIssueList'
import {useI18n} from '@/lib/i18n'
import {useNav} from '@/context/NavContext'

export function Home() {
  const {t} = useI18n()
  const {navigate} = useNav()
  const {issues, loading} = useIssueList()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8fafc]">
        <Spinner />
      </div>
    )
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#f8fafc] px-6 text-center">
        <div className="rounded-full bg-[#f3f4f6] p-10">
          <Frown size={50} color="#9da3ae" />
        </div>
        <p className="mt-3 text-xl font-bold text-[#1f2937]">
          {t('no_grievances_yet')}
        </p>
        <p className="text-base text-[#747985]">{t('no_grievances')}</p>
        <CustomButton
          label={t('report_grievance')}
          onClick={() => navigate('create')}
          className="mt-2"
        />
      </div>
    )
  }

  const recent = issues.slice(0, 5)

  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] pb-6 no-scrollbar">
      <h1 className="px-7 pt-4 text-2xl font-bold text-[#1f2937]">
        {t('welcome')}
      </h1>
      <CustomButton
        label={t('report_new_grievance')}
        onClick={() => navigate('create')}
        icon={<PlusCircle size={20} />}
        className="mt-3"
      />
      <div className="mt-6 px-3">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-lg font-bold text-[#1f2937]">
            {t('my_recent_grievance')}
          </h2>
          <button
            onClick={() => navigate('allIssues')}
            className="text-sm text-[#24c38b]"
          >
            {t('view_all')}
          </button>
        </div>
        {recent.map(issue => (
          <GrievanceCard
            key={issue.id}
            issue={issue}
            onClick={() => navigate('issueDetail', {id: issue.id})}
          />
        ))}
      </div>
    </div>
  )
}

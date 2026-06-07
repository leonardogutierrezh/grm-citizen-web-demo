'use client'

import {Frown} from 'lucide-react'
import {Header, Spinner, CustomButton} from '@/components/ui'
import {GrievanceCard} from '@/components/GrievanceCard'
import {useIssueList} from '@/hooks/useIssueList'
import {useI18n} from '@/lib/i18n'
import {useNav} from '@/context/NavContext'

export function AllIssues() {
  const {t} = useI18n()
  const {navigate, goBack} = useNav()
  const {issues, loading, loadingMore, hasNext, loadMore} = useIssueList()

  return (
    <div className="flex h-full flex-col bg-[#f8fafc]">
      <Header title={t('all_cases')} onBack={goBack} />
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="rounded-full bg-[#f3f4f6] p-10">
            <Frown size={50} color="#9da3ae" />
          </div>
          <p className="mt-3 text-xl font-bold">{t('no_grievances_yet')}</p>
          <p className="text-base text-[#747985]">{t('no_grievances')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-3 no-scrollbar">
          {issues.map(issue => (
            <GrievanceCard
              key={issue.id}
              issue={issue}
              onClick={() => navigate('issueDetail', {id: issue.id})}
            />
          ))}
          {hasNext && (
            <CustomButton
              label={loadingMore ? t('load_more') : t('view_all')}
              onClick={loadMore}
              outline
              disabled={loadingMore}
            />
          )}
          {!hasNext && (
            <p className="py-4 text-center text-sm text-[#9ca3af]">
              {t('no_grievances_to_load')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

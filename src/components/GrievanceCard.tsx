'use client'

import {AlertOctagon, MessageCircle, HelpCircle} from 'lucide-react'
import {Issue} from '@/lib/api'
import {formatDate} from '@/lib/format'
import {getStatusInfo, getCategoryInfo} from '@/lib/colors'
import {useI18n} from '@/lib/i18n'

const iconFor: Record<string, typeof AlertOctagon> = {
  'alert-octagon': AlertOctagon,
  'message-circle': MessageCircle,
  'help-circle': HelpCircle,
}

export function GrievanceCard({
  issue,
  onClick,
}: {
  issue: Issue
  onClick: () => void
}) {
  const {t, lang} = useI18n()
  const statusInfo = getStatusInfo(issue.status)
  const category = getCategoryInfo(issue.issue_type?.name?.toLowerCase())
  const Icon = iconFor[category.icon] || AlertOctagon

  return (
    <button
      onClick={onClick}
      className="mx-4 my-1.5 flex w-[calc(100%-2rem)] items-center rounded-xl bg-white p-4 text-left shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition active:scale-[0.99]"
    >
      <div className="flex flex-1 items-center">
        <div
          className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{backgroundColor: category.color}}
        >
          <Icon size={20} color={category.textColor} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[#1f2937]">
            {issue.tracking_code || 'Untitled Issue'}
          </p>
          <p className="truncate text-sm text-[#6b7280]">
            {issue.issue_type?.name}
          </p>
          <p className="text-xs text-[#9ca3af]">
            {formatDate(issue.intake_date, lang === 'fr' ? 'fr-FR' : 'en-US')}
          </p>
        </div>
      </div>
      <div
        className="ml-2 shrink-0 rounded-2xl px-3 py-1.5 text-center text-xs font-semibold"
        style={{backgroundColor: statusInfo.color, color: statusInfo.textColor}}
      >
        {t(statusInfo.key)}
      </div>
    </button>
  )
}

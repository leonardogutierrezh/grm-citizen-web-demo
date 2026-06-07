'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  Frown,
  Send,
  Star,
  Image as ImageIcon,
  Activity,
  CheckCircle2,
  ClipboardList,
  Flag,
  Shield,
  User,
} from 'lucide-react'
import {Header, Spinner} from '@/components/ui'
import {
  Attachment,
  Comment,
  Issue,
  addComment,
  getIssue,
  listAttachments,
  listComments,
  updateIssue,
} from '@/lib/api'
import {formatDate} from '@/lib/format'
import {getStatusInfo} from '@/lib/colors'
import {useI18n} from '@/lib/i18n'
import {useNav} from '@/context/NavContext'
import {useAuth} from '@/context/AuthContext'

export function IssueDetail() {
  const {t, lang} = useI18n()
  const {goBack, current} = useNav()
  const {session} = useAuth()
  const id = current.params?.id as number
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US'

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [rating, setRating] = useState(0)

  const [rateOpen, setRateOpen] = useState(false)
  const [rateValue, setRateValue] = useState(5)
  const [appealOpen, setAppealOpen] = useState(false)
  const [appealError, setAppealError] = useState('')
  const [appealing, setAppealing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIssue(id)
      setIssue(data)
      setRating(data?.rating || 0)
      if (data?.rating) setRateValue(data.rating)
      const [c, a] = await Promise.all([
        listComments(id).catch(() => null),
        listAttachments(id).catch(() => null),
      ])
      setComments(c?.results || [])
      setAttachments(a?.results || [])
    } catch {
      setIssue(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const onPostComment = async () => {
    if (!commentText.trim()) return
    setPosting(true)
    try {
      await addComment(id, commentText.trim())
      setCommentText('')
      const c = await listComments(id)
      setComments(c?.results || [])
    } catch {
      // ignore
    } finally {
      setPosting(false)
    }
  }

  const onRate = async () => {
    setRating(rateValue)
    setRateOpen(false)
    try {
      await updateIssue(id, {rating: rateValue})
    } catch {
      // ignore
    }
  }

  const onAppeal = async () => {
    setAppealing(true)
    setAppealError('')
    try {
      await updateIssue(id, {appeal_status: true})
      setAppealOpen(false)
    } catch (e: unknown) {
      const err = e as {status?: number}
      setAppealError(
        err?.status === 405
          ? t('appeal_error_unavailable')
          : t('technical_difficulty_error'),
      )
    } finally {
      setAppealing(false)
    }
  }

  // Derive timeline state from the status. Falls back to the status name when
  // the backend doesn't expose the initial/open/final flags.
  const progress = useMemo(() => {
    const st = issue?.status
    const name = st?.name?.toLowerCase() || ''
    const isResolved = st?.final_status ?? /resolv|closed|final/.test(name)
    const isReview =
      st?.open_status ?? (isResolved || /progress|review|open/.test(name))
    const submittedDate = formatDate(issue?.intake_date, locale)
    const updatedDate = formatDate(
      (issue?.updated_date as string) || issue?.intake_date,
      locale,
    )
    return [
      {
        key: 'reported',
        title: t('progress_title_1'),
        subtitle: t('progress_subtitle_1'),
        icon: Flag,
        active: true,
        date: submittedDate,
      },
      {
        key: 'under_review',
        title: t('progress_title_2'),
        subtitle: t('progress_subtitle_2'),
        icon: ClipboardList,
        active: isReview,
        date: isReview ? updatedDate : '—',
      },
      {
        key: 'resolved',
        title: t('progress_title_3'),
        subtitle: t('progress_subtitle_3'),
        icon: CheckCircle2,
        active: isResolved,
        date: isResolved ? updatedDate : '—',
      },
    ]
  }, [issue, locale, t])

  const statusInfo = issue ? getStatusInfo(issue.status) : null

  return (
    <div className="relative flex h-full flex-col bg-[#f6f7f8]">
      <Header title={t('case_detail')} onBack={goBack} />
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : !issue ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="rounded-full bg-[#f3f4f6] p-10">
            <Frown size={50} color="#9da3ae" />
          </div>
          <p className="text-xl font-bold">{t('no_grievances_yet')}</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
            {/* Header card */}
            <div className="mb-3 rounded-2xl border border-[#e6e8eb] bg-white p-4">
              <div className="mb-2 flex justify-end">
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: statusInfo!.color,
                    color: statusInfo!.textColor,
                    borderColor: statusInfo!.textColor + '33',
                  }}
                >
                  {t(statusInfo!.key)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="flex-1 text-xl font-extrabold leading-snug text-[#1f2937]">
                  {(issue.title as string) || issue.issue_type?.name || '—'}
                </h2>
                <span className="shrink-0 text-xs font-bold text-[#458d74]">
                  {t('case_number')} #{issue.id}
                </span>
              </div>

              <div className="mt-4 flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#458d74]">
                    {t('date_of_submission')}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-[#1f2937]">
                    {formatDate(issue.intake_date, locale) || '—'}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#458d74]">
                    {t('case_type')}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-[#1f2937]">
                    {issue.issue_type?.name || '—'}
                  </p>
                </div>
              </div>

              <div className="my-4 h-px bg-[#eef0f2]" />

              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#458d74]">
                {t('description')}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#374151]">
                {issue.description || '—'}
              </p>

              {issue.research_result ? (
                <>
                  <div className="my-4 h-px bg-[#eef0f2]" />
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#458d74]">
                    {t('resolution')}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#374151]">
                    {issue.research_result}
                  </p>
                </>
              ) : null}
            </div>

            {/* Case progress timeline */}
            <div className="mb-3 rounded-2xl border border-[#e6e8eb] bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Activity size={16} color="#24c38b" />
                <h3 className="text-sm font-bold text-[#1f2937]">
                  {t('case_progress')}
                </h3>
              </div>
              <div>
                {progress.map((item, idx) => {
                  const isLast = idx === progress.length - 1
                  const Icon = item.icon
                  return (
                    <div key={item.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: item.active ? '#24c38b' : '#f3f4f6',
                          }}
                        >
                          <Icon
                            size={13}
                            color={item.active ? '#ffffff' : '#9ca3af'}
                          />
                        </div>
                        {!isLast && (
                          <div className="my-1 w-0.5 flex-1 bg-[#e5e7eb]" />
                        )}
                      </div>
                      <div className={isLast ? 'pb-0' : 'pb-4'}>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-[#1f2937]">
                            {item.title}
                          </p>
                          <span className="text-[11px] text-[#9ca3af]">
                            {item.date}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#707070]">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Attachments */}
            <div className="mb-3 rounded-2xl border border-[#e6e8eb] bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-[#1f2937]">
                {t('attachments')} ({attachments.length})
              </h3>
              {attachments.length === 0 ? (
                <p className="py-2 text-sm text-[#747985]">
                  {t('no_attachments_yet')}
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {attachments.map(a => {
                    const url = String(a.file || '')
                    const isImg = /\.(png|jpe?g|gif|webp|bmp)$/i.test(url)
                    return (
                      <a
                        key={a.id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                      >
                        {isImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt="attachment"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={18} color="#707070" />
                        )}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Updates & comments */}
            <div className="mb-3 rounded-2xl border border-[#e6e8eb] bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-[#1f2937]">
                {t('updates_and_comments')}
              </h3>

              {comments.length === 0 ? (
                <p className="py-2 text-sm text-[#747985]">
                  {t('no_comments_yet')}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {comments.map(c => {
                    const text = c.comment || c.text || ''
                    const username =
                      c.user?.username || c.author_name || ''
                    const isMine =
                      c.is_mine ??
                      (!!session?.username &&
                        username === (session.username as string))
                    const author = isMine
                      ? t('you')
                      : c.author_name || c.user?.name || username || t('officer')
                    const when = c.created_date
                      ? formatDate(c.created_date, locale)
                      : ''
                    return (
                      <div
                        key={c.id}
                        className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            backgroundColor: isMine ? '#eef2ff' : '#e1f2eb',
                            borderColor: isMine ? '#dbe3ff' : '#cfe9dd',
                          }}
                        >
                          {isMine ? (
                            <User size={15} color="#24c38b" />
                          ) : (
                            <Shield size={15} color="#24c38b" />
                          )}
                        </div>
                        <div
                          className="max-w-[78%] rounded-2xl border px-3 py-2"
                          style={{
                            backgroundColor: isMine ? '#dff4ea' : '#ffffff',
                            borderColor: isMine ? '#bfead7' : '#e5e7eb',
                          }}
                        >
                          <div
                            className={`mb-0.5 flex items-center gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                          >
                            <span
                              className="text-[11px] font-bold"
                              style={{color: isMine ? '#24c38b' : '#1f2937'}}
                            >
                              {author}
                            </span>
                            <span className="text-[10px] text-[#9ca3af]">
                              {when}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-[#374151]">
                            {text}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Composer */}
              <div className="mt-3 flex items-end gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={t('add_a_comment')}
                  onKeyDown={e => e.key === 'Enter' && onPostComment()}
                  className="flex-1 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#24c38b]"
                />
                <button
                  onClick={onPostComment}
                  disabled={posting || !commentText.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#24c38b] text-white disabled:opacity-40"
                >
                  {posting ? (
                    <Spinner color="white" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex gap-3 border-t border-[#e6e8eb] bg-[#f6f7f8] px-4 py-3">
            {rating ? (
              <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#dff4ea]">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(v => (
                    <Star
                      key={v}
                      size={15}
                      color="#24c38b"
                      fill={v <= rating ? '#24c38b' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-sm font-extrabold text-[#24c38b]">
                  {t('rated')}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setRateOpen(true)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#24c38b]"
              >
                <Star size={18} color="#ffffff" />
                <span className="text-sm font-extrabold text-white">
                  {t('rate')}
                </span>
              </button>
            )}
            <button
              onClick={() => {
                setAppealError('')
                setAppealOpen(true)
              }}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ffe7e4]"
            >
              <Flag size={18} color="#9d3224" />
              <span className="text-sm font-extrabold text-[#9d3224]">
                {t('appeal')}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Rate modal */}
      {rateOpen && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-8"
          onClick={() => setRateOpen(false)}
        >
          <div
            className="w-full rounded-2xl bg-white p-5 text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="mb-4 text-lg font-bold text-[#1f2937]">
              {t('rate_your_experience')}
            </p>
            <div className="mb-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => setRateValue(v)}>
                  <Star
                    size={32}
                    color="#24c38b"
                    fill={v <= rateValue ? '#24c38b' : 'none'}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRateOpen(false)}
                className="flex-1 rounded-lg bg-[#eeeeee] py-2.5 text-sm font-semibold text-[#666666]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onRate}
                className="flex-1 rounded-lg bg-[#24c38b] py-2.5 text-sm font-semibold text-white"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal modal */}
      {appealOpen && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-8"
          onClick={() => setAppealOpen(false)}
        >
          <div
            className="w-full rounded-2xl bg-white p-5 text-center"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[#1f2937]">
              {t('appeal_confirmation')}
            </p>
            {appealError && (
              <p className="mt-2 text-sm text-[#ef6a78]">{appealError}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setAppealOpen(false)}
                className="flex-1 rounded-lg bg-[#eeeeee] py-2.5 text-sm font-semibold text-[#666666]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onAppeal}
                disabled={appealing}
                className="flex-1 rounded-lg bg-[#24c38b] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {appealing ? t('saving') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

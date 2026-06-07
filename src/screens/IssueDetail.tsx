'use client'

import {useCallback, useEffect, useState} from 'react'
import {Frown, Send, Star, Paperclip, MessageSquare} from 'lucide-react'
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
import {formatDate, formatDateTime} from '@/lib/format'
import {getStatusInfo} from '@/lib/colors'
import {useI18n} from '@/lib/i18n'
import {useNav} from '@/context/NavContext'

function DetailRow({
  label,
  children,
  last,
}: {
  label: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${last ? '' : 'border-b border-[#dedede]'}`}
    >
      <span className="text-base text-[#707070]">{label}</span>
      <span className="text-base text-[#1f2937]">{children}</span>
    </div>
  )
}

export function IssueDetail() {
  const {t, lang} = useI18n()
  const {goBack, current} = useNav()
  const id = current.params?.id as number
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US'

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [rating, setRating] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIssue(id)
      setIssue(data)
      setRating(data?.rating || 0)
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

  const onRate = async (value: number) => {
    setRating(value)
    try {
      await updateIssue(id, {rating: value})
    } catch {
      // ignore
    }
  }

  const isResolved = issue?.status?.name?.toLowerCase().includes('resolv')

  return (
    <div className="flex h-full flex-col bg-[#f8fafc]">
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
        <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
          {/* Detail table */}
          <div className="rounded-lg border border-[#dedede] bg-white px-4">
            <DetailRow label={t('date_submission')}>
              {formatDate(issue.intake_date, locale)}
            </DetailRow>
            <DetailRow label={t('issue_date')}>
              {formatDate(issue.created_date as string, locale)}
            </DetailRow>
            <DetailRow label={t('issue_type')}>
              {issue.issue_type?.name}
            </DetailRow>
            <DetailRow label={t('status')} last>
              <span
                className="rounded-2xl px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: getStatusInfo(issue.status).color,
                  color: getStatusInfo(issue.status).textColor,
                }}
              >
                {t(getStatusInfo(issue.status).key)}
              </span>
            </DetailRow>
          </div>

          {/* Description */}
          <h3 className="mt-5 text-lg font-bold text-[#1f2937]">
            {t('description')}
          </h3>
          <p className="mt-2 text-base text-[#374151]">{issue.description}</p>

          {/* Rating when resolved */}
          {isResolved && (
            <div className="mt-5 rounded-lg border border-[#dedede] bg-white p-4">
              <p className="mb-2 text-base font-semibold text-[#1f2937]">
                {t('rate_your_experience')}
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => onRate(v)}>
                    <Star
                      size={28}
                      color="#f5ba74"
                      fill={v <= rating ? '#f5ba74' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <h3 className="mt-6 flex items-center gap-2 text-lg font-bold text-[#1f2937]">
            <Paperclip size={18} /> {t('attachments')}
          </h3>
          {attachments.length === 0 ? (
            <p className="py-4 text-center text-base text-[#747985]">
              {t('no_attachments_yet')}
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {attachments.map(a => {
                const url = String(a.file || '')
                const isImg = /\.(png|jpe?g|gif|webp|bmp)$/i.test(url)
                return (
                  <a
                    key={a.id}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-[#dedede] bg-white"
                  >
                    {isImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="attachment" className="h-full w-full object-cover" />
                    ) : (
                      <Paperclip size={22} color="#9ca3af" />
                    )}
                  </a>
                )
              })}
            </div>
          )}

          {/* Comments / timeline */}
          <h3 className="mt-6 flex items-center gap-2 text-lg font-bold text-[#1f2937]">
            <MessageSquare size={18} /> {t('updates_and_comments')}
          </h3>
          {comments.length === 0 ? (
            <p className="py-4 text-center text-base text-[#747985]">
              {t('no_comments_yet')}
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {comments.map(c => (
                <div
                  key={c.id}
                  className="rounded-lg border border-[#dedede] bg-white p-3"
                >
                  <p className="text-sm text-[#374151]">{c.text}</p>
                  <p className="mt-1 text-xs text-[#9ca3af]">
                    {c.user?.name || c.user?.username || ''}{' '}
                    {c.created_date
                      ? `· ${formatDateTime(c.created_date, locale)}`
                      : ''}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div className="mt-3 flex items-center gap-2 pb-4">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={t('add_a_comment')}
              onKeyDown={e => e.key === 'Enter' && onPostComment()}
              className="flex-1 rounded-full border border-[#dedede] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24c38b]"
            />
            <button
              onClick={onPostComment}
              disabled={posting || !commentText.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24c38b] text-white disabled:opacity-40"
            >
              {posting ? <Spinner color="white" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

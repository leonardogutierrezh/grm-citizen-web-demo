'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import {
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  Lock,
  Check,
  UploadCloud,
  X,
  FileText,
} from 'lucide-react'
import {Header, CustomButton, Spinner} from '@/components/ui'
import {Dropdown, Option} from '@/components/Dropdown'
import {
  Lookup,
  addAttachment,
  createIssue,
  getComponents,
  getIssueCategories,
  getIssueSubtypes,
  getIssueTypes,
  getRegionChildren,
  getRegions,
  getSubcomponents,
} from '@/lib/api'
import {useI18n} from '@/lib/i18n'
import {useNav} from '@/context/NavContext'
import {useAuth} from '@/context/AuthContext'

type Conf = 'non_confidential' | 'confidential' | 'anonymous'

function toOpt(l: Lookup): Option {
  return {id: l.id, name: l.name}
}

export function Create() {
  const {t} = useI18n()
  const {resetTo, goBack, setTab} = useNav()
  const {session} = useAuth()

  const [step, setStep] = useState(0)
  const [loadingLookups, setLoadingLookups] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')

  // lookups
  const [types, setTypes] = useState<Lookup[]>([])
  const [subtypes, setSubtypes] = useState<Lookup[]>([])
  const [categories, setCategories] = useState<Lookup[]>([])
  const [components, setComponents] = useState<Lookup[]>([])
  const [subcomponents, setSubcomponents] = useState<Lookup[]>([])
  const [regions, setRegions] = useState<Lookup[]>([])
  const [wards, setWards] = useState<Lookup[]>([])

  // form state
  const [conf, setConf] = useState<Conf>('non_confidential')
  const [issueType, setIssueType] = useState<Option | null>(null)
  const [subType, setSubType] = useState<Option | null>(null)
  const [category, setCategory] = useState<Option | null>(null)
  const [component, setComponent] = useState<Option | null>(null)
  const [subComponent, setSubComponent] = useState<Option | null>(null)
  const [occurDate, setOccurDate] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState<Option | null>(null)
  const [ward, setWard] = useState<Option | null>(null)
  const [locationDesc, setLocationDesc] = useState('')
  const [certified, setCertified] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Which personal fields each confidentiality level shares — mirrors the
  // native CreateIssue.updateConfidentiality switch.
  const sharedFields: {key: string; shared: boolean}[] = useMemo(() => {
    const all = conf === 'non_confidential'
    const some = conf !== 'anonymous'
    return [
      {key: 'name', shared: all},
      {key: 'age', shared: some},
      {key: 'gender', shared: some},
      {key: 'citizen_group_1', shared: some},
      {key: 'citizen_group_2', shared: some},
    ]
  }, [conf])

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || [])
    if (picked.length) setAttachments(prev => [...prev, ...picked])
    e.target.value = ''
  }

  const removeAttachment = (idx: number) =>
    setAttachments(prev => prev.filter((_, i) => i !== idx))

  useEffect(() => {
    ;(async () => {
      setLoadingLookups(true)
      const [ty, st, cat, comp, sub, reg] = await Promise.all([
        getIssueTypes().catch(() => null),
        getIssueSubtypes().catch(() => null),
        getIssueCategories().catch(() => null),
        getComponents().catch(() => null),
        getSubcomponents().catch(() => null),
        getRegions().catch(() => null),
      ])
      setTypes(ty?.results || [])
      setSubtypes(st?.results || [])
      setCategories(cat?.results || [])
      setComponents(comp?.results || [])
      setSubcomponents(sub?.results || [])
      setRegions(reg?.results || [])
      setLoadingLookups(false)
    })()
  }, [])

  const filteredSubtypes = useMemo(() => {
    if (!issueType) return subtypes
    const f = subtypes.filter(
      s => (s.parent as {id?: number})?.id === issueType.id || s.parent === issueType.id,
    )
    return f.length ? f : subtypes
  }, [subtypes, issueType])

  const filteredSubcomponents = useMemo(() => {
    if (!component) return subcomponents
    const f = subcomponents.filter(
      s => (s.parent as {id?: number})?.id === component.id || s.parent === component.id,
    )
    return f.length ? f : subcomponents
  }, [subcomponents, component])

  const onPickRegion = async (o: Option) => {
    setRegion(o)
    setWard(null)
    try {
      const children = await getRegionChildren(Number(o.id))
      setWards(children?.results || [])
    } catch {
      setWards([])
    }
  }

  const canSubmit =
    !!issueType && !!subType && !!category && !!description && !!region

  const onSubmit = async () => {
    setSubmitError('')
    setSubmitting(true)
    const tracking = `WEB-${Date.now().toString().slice(-8)}`
    // The confidentiality choice maps to whether the citizen's name is shared.
    const citizenName =
      conf === 'anonymous'
        ? 'Anonyme'
        : (session?.username as string) || 'Citoyen'
    const payload: Record<string, unknown> = {
      description,
      category: category!.id,
      issue_type: issueType!.id,
      issue_sub_type: subType!.id,
      // Backend MEDIUM_CHOICES are: anonymous | facilitator | channel-alert.
      contact_medium: 'anonymous',
      contact_information: '',
      tracking_code: tracking,
      intake_date: occurDate
        ? new Date(occurDate).toISOString()
        : new Date().toISOString(),
      administrative_region: region!.id,
      ongoing_issue: false,
      // reporter is required by IssueCreateSerializer.
      reporter: session?.user_id,
      // create() reads these citizen keys directly, so all must be present.
      citizen: {
        name: citizenName,
        age_group: null,
        type: null,
        group: null,
        group_2: null,
      },
    }
    if (component) payload.component = component.id
    if (subComponent) payload.sub_component = subComponent.id
    if (locationDesc) payload.location_description = locationDesc
    try {
      const res = await createIssue(payload)
      const data = (res as {data?: {id?: number; tracking_code?: string}})?.data
      // Upload any attachments to the freshly-created issue.
      const newId = data?.id
      if (newId && attachments.length) {
        setUploading(true)
        for (const file of attachments) {
          try {
            await addAttachment(newId, file)
          } catch {
            // A failed upload shouldn't block the success screen.
          }
        }
        setUploading(false)
      }
      setCreatedCode(data?.tracking_code || tracking)
    } catch (e: unknown) {
      const err = e as {data?: unknown}
      setSubmitError(
        typeof err?.data === 'string'
          ? err.data
          : JSON.stringify(err?.data || t('technical_difficulty_error')),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const finish = () => {
    setTab('home')
    resetTo('home')
  }

  // Success screen
  if (createdCode) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 bg-white px-8 text-center animate-fade-in">
        <CheckCircle2 size={88} color="#24c38b" />
        <p className="text-2xl font-bold text-[#1f2937]">
          {t('case_created_successfully')}
        </p>
        <div className="rounded-xl bg-[#e1f2eb] px-6 py-4">
          <p className="text-sm text-[#707070]">{t('tracking_code')}</p>
          <p className="mt-1 text-xl font-bold tracking-wider text-[#24c38b]">
            {createdCode}
          </p>
        </div>
        <CustomButton label={t('ok')} onClick={finish} fullWidth={false} className="w-48" />
      </div>
    )
  }

  const steps = [
    t('create_issue'),
    t('case_details_step_2_title'),
    t('case_details_step_3_title'),
    t('step_4_case_summary'),
  ]

  return (
    <div className="flex h-full flex-col bg-[#f8fafc]">
      <Header
        title={t('create_issue')}
        onBack={step === 0 ? goBack : () => setStep(s => s - 1)}
      />

      {/* Stepper */}
      <div className="flex items-center gap-1.5 px-5 py-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{backgroundColor: i <= step ? '#24c38b' : '#dedede'}}
          />
        ))}
      </div>

      {loadingLookups ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">
          {/* STEP 1 — confidentiality */}
          {step === 0 && (
            <div className="animate-screen-in">
              <h2 className="mb-1 text-lg font-bold text-[#1f2937]">
                {t('create_issue_step_1')}
              </h2>
              <p className="mb-4 text-sm text-[#707070]">
                {t('create_issue_step_1_subtitle')}
              </p>
              {(
                [
                  {key: 'non_confidential', icon: Eye},
                  {key: 'confidential', icon: ShieldCheck},
                  {key: 'anonymous', icon: EyeOff},
                ] as {key: Conf; icon: typeof Eye}[]
              ).map(({key, icon: Icon}) => (
                <button
                  key={key}
                  onClick={() => setConf(key)}
                  className="mb-3 flex w-full items-start gap-3 rounded-xl border-2 bg-white p-4 text-left transition"
                  style={{
                    borderColor: conf === key ? '#24c38b' : '#dedede',
                  }}
                >
                  <Icon
                    size={24}
                    color={conf === key ? '#24c38b' : '#707070'}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[#1f2937]">{t(key)}</p>
                    <p className="text-sm text-[#707070]">
                      {t(`${key}_description`)}
                    </p>
                  </div>
                  {conf === key && <Check size={20} color="#24c38b" />}
                </button>
              ))}

              {/* Shared information — reflects what the chosen level reveals */}
              <div className="mt-5 rounded-xl border border-[#dedede] bg-white p-4 shadow-sm">
                <p className="mb-3 text-base font-bold text-[#1f2937]">
                  {t('shared_information')}
                </p>
                <div className="flex flex-col gap-2.5">
                  {sharedFields.map(({key, shared}) => (
                    <div key={key} className="flex items-center gap-2.5">
                      {shared ? (
                        <CheckCircle2 size={20} color="#24c38b" />
                      ) : (
                        <Circle size={20} color="#9da3ae" />
                      )}
                      <span
                        className="text-sm transition-colors"
                        style={{color: shared ? '#374151' : '#9da3ae'}}
                      >
                        {t(key)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <CustomButton
                label={t('save_and_continue')}
                onClick={() => setStep(1)}
                className="mt-4"
              />
            </div>
          )}

          {/* STEP 2 — case details */}
          {step === 1 && (
            <div className="animate-screen-in">
              <h2 className="mb-4 text-lg font-bold text-[#1f2937]">
                {t('case_details_step_2_title')}
              </h2>
              <Dropdown
                label={t('case_type')}
                placeholder={t('select_case_type')}
                options={types.map(toOpt)}
                value={issueType}
                onChange={o => {
                  setIssueType(o)
                  setSubType(null)
                }}
              />
              <Dropdown
                label={t('case_subtype')}
                placeholder={t('select_option')}
                options={filteredSubtypes.map(toOpt)}
                value={subType}
                onChange={setSubType}
              />
              <Dropdown
                label={t('case_category')}
                placeholder={t('select_option')}
                options={categories.map(toOpt)}
                value={category}
                onChange={setCategory}
              />
              <Dropdown
                label={t('case_component')}
                placeholder={t('select_option')}
                options={components.map(toOpt)}
                value={component}
                onChange={o => {
                  setComponent(o)
                  setSubComponent(null)
                }}
              />
              <Dropdown
                label={t('case_sub_component')}
                placeholder={t('select_option')}
                options={filteredSubcomponents.map(toOpt)}
                value={subComponent}
                onChange={setSubComponent}
              />
              <div className="mb-4">
                <p className="mb-2 text-base font-bold text-[#4A4A4A]">
                  {t('date_of_occurrence')}
                </p>
                <input
                  type="date"
                  value={occurDate}
                  onChange={e => setOccurDate(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-[#4A4A4A] outline-none focus:border-[#24c38b]"
                />
              </div>
              <div className="mb-4">
                <p className="mb-2 text-base font-bold text-[#4A4A4A]">
                  {t('case_description_input_label')}
                </p>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('what_is_this_issue_about')}
                  className="w-full resize-none rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-[#4A4A4A] outline-none focus:border-[#24c38b]"
                />
              </div>

              {/* Attachments */}
              <div className="mb-4">
                <p className="mb-1 text-base font-bold text-[#4A4A4A]">
                  {t('include_attachments_title')}
                </p>
                <p className="mb-3 text-sm text-[#707070]">
                  {t('include_attachments_subtitle')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf,.doc,.docx"
                  onChange={onPickFiles}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-[10px] border-2 border-dashed border-[#dedede] bg-white px-4 py-6 text-center transition hover:border-[#24c38b]"
                >
                  <UploadCloud size={28} color="#24c38b" />
                  <span className="text-sm font-semibold text-[#1f2937]">
                    {t('attach_other_files')}
                  </span>
                  <span className="text-xs text-[#707070]">
                    {t('attach_other_files_description')}
                  </span>
                  <span className="mt-1 rounded-full bg-[#e1f2eb] px-4 py-1.5 text-sm font-semibold text-[#24c38b]">
                    {t('browse_files')}
                  </span>
                </button>

                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {attachments.map((file, idx) => {
                      const isImg = file.type.startsWith('image/')
                      const url = isImg ? URL.createObjectURL(file) : ''
                      return (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center gap-3 rounded-[10px] border border-[#dedede] bg-white p-2.5"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f3f4f6]">
                            {isImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={url}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileText size={20} color="#9ca3af" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#1f2937]">
                              {file.name}
                            </p>
                            <p className="text-xs text-[#707070]">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            aria-label={t('remove')}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#ef6a78]"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <CustomButton
                label={t('save_and_continue')}
                onClick={() => setStep(2)}
                disabled={!issueType || !subType || !category || !description}
                className="mt-2"
              />
            </div>
          )}

          {/* STEP 3 — location */}
          {step === 2 && (
            <div className="animate-screen-in">
              <h2 className="mb-1 text-lg font-bold text-[#1f2937]">
                {t('case_details_step_3_title')}
              </h2>
              <p className="mb-4 text-sm text-[#707070]">
                {t('case_details_step_3_subtitle')}
              </p>
              <Dropdown
                label={t('select_location_district')}
                placeholder={t('select_location_district')}
                options={regions.map(toOpt)}
                value={region}
                onChange={onPickRegion}
              />
              <Dropdown
                label={t('location_ward_dropdown')}
                placeholder={t('location_ward_dropdown_placeholder')}
                options={wards.map(toOpt)}
                value={ward}
                onChange={setWard}
                disabled={!region}
              />
              <div className="mb-4">
                <p className="mb-2 text-base font-bold text-[#4A4A4A]">
                  {t('location_description_title')}
                </p>
                <textarea
                  value={locationDesc}
                  onChange={e => setLocationDesc(e.target.value)}
                  rows={3}
                  placeholder={t('location_details_text_input_placeholder')}
                  className="w-full resize-none rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-[#4A4A4A] outline-none focus:border-[#24c38b]"
                />
              </div>
              <CustomButton
                label={t('save_and_continue')}
                onClick={() => setStep(3)}
                disabled={!region}
                className="mt-2"
              />
            </div>
          )}

          {/* STEP 4 — summary */}
          {step === 3 && (
            <div className="animate-screen-in">
              <h2 className="mb-3 text-lg font-bold text-[#1f2937]">
                {t('step_4_case_summary')}
              </h2>

              <div className="mb-4 rounded-xl border border-[#dedede] bg-white p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#707070]">
                  {t('security_level')}
                </p>
                <div className="flex items-center gap-2">
                  <Lock size={18} color="#24c38b" />
                  <span className="font-semibold text-[#1f2937]">
                    {t(conf)}
                  </span>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-[#dedede] bg-white p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#707070]">
                  {t('information_ledger')}
                </p>
                <SummaryRow label={t('case_type')} value={issueType?.name} />
                <SummaryRow label={t('case_subtype')} value={subType?.name} />
                <SummaryRow label={t('category')} value={category?.name} />
                <SummaryRow label={t('case_component')} value={component?.name} />
                <SummaryRow
                  label={t('date_and_time')}
                  value={occurDate || new Date().toLocaleDateString()}
                />
                <SummaryRow label={t('description')} value={description} />
              </div>

              {attachments.length > 0 && (
                <div className="mb-4 rounded-xl border border-[#dedede] bg-white p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#707070]">
                    {t('attachments')} ({attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, idx) => {
                      const isImg = file.type.startsWith('image/')
                      const url = isImg ? URL.createObjectURL(file) : ''
                      return (
                        <div
                          key={`sum-${file.name}-${idx}`}
                          className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                        >
                          {isImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={url}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText size={20} color="#9ca3af" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4 rounded-xl border border-[#dedede] bg-white p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#707070]">
                  {t('geo_location')}
                </p>
                <SummaryRow label={t('select_location_district')} value={region?.name} />
                <SummaryRow label={t('location_ward_dropdown')} value={ward?.name} />
                {locationDesc && (
                  <SummaryRow label={t('location_description_title')} value={locationDesc} />
                )}
              </div>

              <label className="mb-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={certified}
                  onChange={e => setCertified(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#24c38b]"
                />
                <span className="text-sm text-[#374151]">
                  {t('certify_information_true')}
                </span>
              </label>

              {submitError && (
                <p className="mb-2 rounded-lg bg-red-50 p-2 text-xs text-[#ef6a78]">
                  {submitError}
                </p>
              )}

              <CustomButton
                label={
                  uploading
                    ? t('uploading_attachments')
                    : submitting
                      ? t('saving')
                      : t('submit_case')
                }
                onClick={onSubmit}
                disabled={!canSubmit || !certified || submitting}
                className="mt-1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryRow({label, value}: {label: string; value?: string}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#f1f1f1] py-2 last:border-0">
      <span className="shrink-0 text-sm text-[#707070]">{label}</span>
      <span className="text-right text-sm font-medium text-[#1f2937]">
        {value || '—'}
      </span>
    </div>
  )
}

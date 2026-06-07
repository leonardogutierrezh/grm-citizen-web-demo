// Browser-side API client. All requests go through the same-origin proxy
// (/api/proxy/...) which forwards to the GRM Benin backend.

const SESSION_KEY = 'grmapp-web-session-key'

export type Session = {
  token: string
  user_id?: number
  username?: string
  [k: string]: unknown
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function storeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function authHeaders(): Record<string, string> {
  const s = getSession()
  return s?.token ? {Authorization: `Token ${s.token}`} : {}
}

// Normalize a backend path (e.g. "/issues/reporter/?page=1") into a proxy URL.
function toProxyUrl(path: string): string {
  // strip absolute backend origin if a full url is passed (pagination "next")
  const cleaned = path.replace(/^https?:\/\/[^/]+/, '')
  const noLeadingSlash = cleaned.replace(/^\//, '')
  return `/api/proxy/${noLeadingSlash}`
}

type ReqOptions = {
  method?: string
  body?: unknown
  isForm?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ReqOptions = {},
): Promise<T> {
  const {method = 'GET', body, isForm = false} = options
  const headers: Record<string, string> = {...authHeaders()}
  let payload: BodyInit | undefined

  if (body !== undefined && body !== null) {
    if (isForm) {
      payload = body as FormData
    } else {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
  }

  const res = await fetch(toProxyUrl(path), {method, headers, body: payload})
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw {status: res.status, data}
  }
  return data as T
}

// ---- Auth ----
export async function login(username: string, password: string) {
  return apiRequest<Session & {error?: string}>('/authentication/login/', {
    method: 'POST',
    body: {username, password},
  })
}

export async function register(data: Record<string, unknown>) {
  return apiRequest<{errors?: Record<string, string[]>; data?: {username: string}}>(
    '/authentication/register/',
    {method: 'POST', body: data},
  )
}

// ---- Issues ----
export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export function listReporterIssues(nextPage?: string | null) {
  const url = nextPage ?? '/issues/reporter/?page=1&page_size=10'
  return apiRequest<Paginated<Issue>>(url)
}

export function getIssue(id: number | string) {
  return apiRequest<Issue>(`/issues/${id}/`)
}

export function createIssue(payload: Record<string, unknown>) {
  return apiRequest<{message?: string; data?: Issue} | Issue>('/issues/create/', {
    method: 'POST',
    body: payload,
  })
}

export function updateIssue(id: number | string, payload: Record<string, unknown>) {
  return apiRequest(`/issues/${id}/update/`, {method: 'PATCH', body: payload})
}

export function addComment(id: number | string, text: string) {
  return apiRequest(`/issues/${id}/add-comment`, {
    method: 'POST',
    body: {text},
  })
}

export function listComments(id: number | string, page = 1) {
  return apiRequest<Paginated<Comment>>(
    `/issues/${id}/comments/?page=${page}&page_size=10`,
  )
}

export function listAttachments(id: number | string, page = 1) {
  return apiRequest<Paginated<Attachment>>(
    `/issues/${id}/attachments/?page=${page}&page_size=10`,
  )
}

// Uploads a single file to an existing issue. The backend (DRF) reads the
// "file" multipart field — see addIssueAttachment in the native app.
export function addAttachment(id: number | string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiRequest(`/issues/${id}/add-attachment`, {
    method: 'POST',
    body: form,
    isForm: true,
  })
}

// ---- Lookups ----
export const getIssueTypes = () => apiRequest<Paginated<Lookup>>('/issues/issue-types/')
export const getIssueSubtypes = () =>
  apiRequest<Paginated<Lookup>>('/issues/issue-subtypes/')
export const getIssueCategories = () =>
  apiRequest<Paginated<Lookup>>('/issues/issue-categories/')
export const getComponents = () => apiRequest<Paginated<Lookup>>('/issues/components/')
export const getSubcomponents = () =>
  apiRequest<Paginated<Lookup>>('/issues/subcomponents/')
export const getRegions = () => apiRequest<Paginated<Lookup>>('/issues/regions/')
export const getRegionChildren = (parent: number) =>
  apiRequest<Paginated<Lookup>>(`/issues/region-children/?parent=${parent}`)

// ---- Profile ----
export const getCitizenDetail = () =>
  apiRequest<Record<string, unknown>>('/authentication/citizen-detail')
export const updateCitizen = (data: Record<string, unknown>) =>
  apiRequest('/authentication/citizen-update/', {method: 'PATCH', body: data})

// ---- Types ----
export type Lookup = {id: number; name: string; [k: string]: unknown}
export type Issue = {
  id: number
  tracking_code?: string
  intake_date?: string
  description?: string
  status?: {
    name?: string
    initial_status?: boolean
    open_status?: boolean
    final_status?: boolean
  } | null
  issue_type?: {name?: string} | null
  category?: {name?: string} | null
  administrative_region?: {name?: string} | null
  rating?: number | null
  resolution_date?: string | null
  updated_date?: string | null
  research_result?: string | null
  [k: string]: unknown
}
export type Comment = {
  id: number
  text?: string
  comment?: string
  created_date?: string
  is_mine?: boolean
  author_name?: string
  user?: {name?: string; username?: string} | null
  [k: string]: unknown
}
export type Attachment = {
  id: number
  file?: string
  created_date?: string
  [k: string]: unknown
}

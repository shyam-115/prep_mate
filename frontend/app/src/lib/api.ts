// ─── Central API Client ───────────────────────────────────────────────────────
// • Attaches Bearer access token from memory on every request
// • On 401, attempts a silent refresh via the httpOnly cookie
// • On second 401 (refresh failed), dispatches a custom event so AuthContext
//   can force logout — no direct import cycle needed
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL as string

// In-memory access token — never put this in localStorage
let _accessToken: string | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

// ── Low-level fetch wrapper ───────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  /** Skip auth header (for login / register / refresh) */
  skipAuth?: boolean
  /** Internal flag to prevent infinite retry loops */
  _isRetry?: boolean
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { skipAuth, _isRetry, ...init } = opts

  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  if (!skipAuth && _accessToken) {
    headers.set('Authorization', `Bearer ${_accessToken}`)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include', // send httpOnly refresh cookie
  })

  // ── Silent token refresh on 401 ──────────────────────────────────────────
  if (res.status === 401 && !_isRetry && !skipAuth) {
    const refreshed = await silentRefresh()
    if (refreshed) {
      // Retry original request once with new token
      return request<T>(path, { ...opts, _isRetry: true })
    }
    // Refresh failed — force logout
    window.dispatchEvent(new CustomEvent('auth:logout'))
    throw createApiError('Session expired. Please log in again.', 401)
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      message = body.error ?? body.message ?? message
      if (body.details && typeof body.details === 'object') {
        const detailsStr = Object.entries(body.details)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\\n')
        if (detailsStr) message += `\\n${detailsStr}`
      }
    } catch { /* ignore parse errors */ }
    throw createApiError(message, res.status)
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

async function silentRefresh(): Promise<boolean> {
  try {
    const data = await request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
      _isRetry: true, // prevent recursive loop
    })
    setAccessToken(data.accessToken)
    return true
  } catch {
    setAccessToken(null)
    return false
  }
}

// ── Typed API Error ───────────────────────────────────────────────────────────

export interface ApiError extends Error {
  status: number
}

export function createApiError(message: string, status: number): ApiError {
  const err = new Error(message) as ApiError
  err.name = 'ApiError'
  err.status = status
  return err
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && (err as ApiError).name === 'ApiError'
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface ApiUser {
  _id: string
  name: string
  email: string
  role: 'LEARNER' | 'ADMIN'
  avatarUrl?: string
  status: string
  emailVerified: boolean
  createdAt: string
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ accessToken: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    }),

  refresh: () =>
    request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => request<ApiUser>('/auth/me'),

  deleteAccount: (password: string) =>
    request<{ message: string }>('/auth/me', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<{ message: string }>('/auth/verify-otp', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, otp }),
    }),

  resendOtp: (email: string) =>
    request<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

// ── Topics ────────────────────────────────────────────────────────────────────

export interface ApiTopic {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order: number
  published: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const topicsApi = {
  list: () => request<PaginatedResponse<ApiTopic>>('/topics?limit=100'),
  getBySlug: (slug: string) => request<ApiTopic>(`/topics/${slug}`),
  adminList: () => request<PaginatedResponse<ApiTopic>>('/topics/admin/all?limit=100'),
  create: (data: Partial<ApiTopic>) =>
    request<ApiTopic>('/topics', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiTopic>) =>
    request<ApiTopic>(`/topics/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/topics/${id}`, { method: 'DELETE' }),
}

// ── Concepts ──────────────────────────────────────────────────────────────────

export interface ApiConcept {
  _id: string
  topicId: string
  title: string
  slug: string
  summary: string
  body: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  hasCode: boolean
  published: boolean
  createdAt: string
}

export const conceptsApi = {
  list: (params?: { page?: number }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    q.set('limit', '100')
    return request<PaginatedResponse<ApiConcept>>(`/concepts?${q.toString()}`)
  },
  adminList: (params?: { page?: number }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    q.set('limit', '100')
    return request<PaginatedResponse<ApiConcept>>(`/concepts/admin/all?${q.toString()}`)
  },
  listByTopic: (topicSlug: string) =>
    request<PaginatedResponse<ApiConcept>>(`/concepts/topic/${topicSlug}?limit=100`),
  getBySlug: (slug: string) => request<ApiConcept>(`/concepts/${slug}`),
  create: (data: Partial<ApiConcept>) =>
    request<ApiConcept>('/concepts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiConcept>) =>
    request<ApiConcept>(`/concepts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/concepts/${id}`, { method: 'DELETE' }),
}

// ── Questions ─────────────────────────────────────────────────────────────────

export interface ApiQuestion {
  _id: string
  topicId: string
  title: string
  problemStatement: string
  constraints?: string
  example?: string
  solution?: string
  hint?: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  concepts: string[]
  published: boolean
  createdAt: string
}

export const questionsApi = {
  list: (params?: { topicId?: string; difficulty?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.topicId) q.set('topicId', params.topicId)
    if (params?.difficulty) q.set('difficulty', params.difficulty)
    if (params?.page) q.set('page', String(params.page))
    q.set('limit', '50')
    return request<PaginatedResponse<ApiQuestion>>(`/questions?${q.toString()}`)
  },
  adminList: (params?: { topicId?: string; difficulty?: string; status?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.topicId) q.set('topicId', params.topicId)
    if (params?.difficulty) q.set('difficulty', params.difficulty)
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    q.set('limit', '50')
    return request<PaginatedResponse<ApiQuestion>>(`/questions/admin/all?${q.toString()}`)
  },
  getById: (id: string) => request<ApiQuestion>(`/questions/${id}`),
  create: (data: Partial<ApiQuestion>) =>
    request<ApiQuestion>('/questions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ApiQuestion>) =>
    request<ApiQuestion>(`/questions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/questions/${id}`, { method: 'DELETE' }),
}

// ── Progress ──────────────────────────────────────────────────────────────────

export interface ApiProgress {
  topicId: string | ApiTopic
  completedConcepts: string[]
  progressPercent: number
  lastSessionNote: string
  updatedAt: string
}

export const progressApi = {
  list: () => request<ApiProgress[]>('/me/progress'),
  update: (topicId: string, data: Partial<ApiProgress>) =>
    request<ApiProgress>(`/me/progress/${topicId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  markConceptCompleted: (conceptId: string) =>
    request<ApiProgress>(`/me/progress/concept/${conceptId}/complete`, { method: 'POST' }),
}

// ── Streak ────────────────────────────────────────────────────────────────────

export interface ApiStreak {
  currentDays: number
  longestDays: number
  lastActiveAt: string
}

export const streakApi = {
  get: () => request<ApiStreak>('/me/streak'),
  ping: () => request<ApiStreak>('/me/streak/ping', { method: 'POST' }),
}

// ── Milestones ────────────────────────────────────────────────────────────────

export interface ApiMilestone {
  _id: string
  title: string
  subtitle: string
  createdAt: string
}

export const milestonesApi = {
  list: () => request<ApiMilestone[]>('/me/milestones'),
  create: (data: { title: string; subtitle: string }) =>
    request<ApiMilestone>('/me/milestones', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export interface ApiOnboarding {
  goal: string
  level: string
  topics: string[]
}

export const onboardingApi = {
  get: () => request<ApiOnboarding>('/me/onboarding'),
  save: (data: ApiOnboarding) =>
    request<ApiOnboarding>('/me/onboarding', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Admin — Users ─────────────────────────────────────────────────────────────

export const adminApi = {
  listUsers: (params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    q.set('limit', '20')
    return request<PaginatedResponse<ApiUser>>(`/admin/users?${q.toString()}`)
  },
  getUser: (id: string) => request<ApiUser>(`/admin/users/${id}`),
  setStatus: (id: string, status: 'ACTIVE' | 'BLOCKED') =>
    request<ApiUser>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  exportUsers: () =>
    fetch(`${BASE_URL}/admin/users/export`, {
      headers: { Authorization: `Bearer ${_accessToken}` },
      credentials: 'include',
    }),
  auditLogs: (page = 1) =>
    request<PaginatedResponse<{ _id: string; action: string; actorId: ApiUser; targetId?: string; createdAt: string }>>(
      `/admin/audit-logs?page=${page}&limit=20`
    ),
  getAnalytics: () =>
    request<{
      totalUsers: number;
      totalTopics: number;
      totalQuestions: number;
      userGrowth: number[];
      topTopics: { name: string; sessions: number; percent: number }[];
      funnel: {
        registered: number;
        completedOnboarding: number;
        solved5Questions: number;
        hitStreak: number;
        referredFriend: number;
      };
    }>('/admin/analytics'),
}

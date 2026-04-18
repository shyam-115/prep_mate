import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import Icon from '@components/ui/Icon'
import { isApiError } from '@lib/api'

type DemoRole = 'learner' | 'admin'

const DEMO_CREDENTIALS: Record<DemoRole, { email: string; password: string }> = {
  learner: { email: 'learner@prepmate.io', password: 'learner123' },
  admin:   { email: 'admin@prepmate.io',   password: 'admin123'   },
}

export default function LoginPage() {
  const { login, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  // Prefer location.state.from (set by AppLayout guard), fall back to ?redirect= query param
  const stateFrom = (location.state as { from?: Location })?.from?.pathname
  const redirect = stateFrom ?? searchParams.get('redirect') ?? '/'

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [showPw, setShowPw]       = useState(false)
  const [isUnverified, setIsUnverified] = useState(false)

  // Already logged in — send to dashboard
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsUnverified(false)
    try {
      await login(email, password)
      navigate(redirect, { replace: true })
    } catch (err) {
      // 403 with email-verify message → show OTP redirect CTA
      if (isApiError(err) && err.status === 403 && err.message.toLowerCase().includes('verify')) {
        setIsUnverified(true)
        setError('Your email address is not verified yet.')
      } else {
        setError(err instanceof Error ? err.message : 'Login failed.')
      }
    }
  }

  const fillDemo = (role: DemoRole) => {
    const creds = DEMO_CREDENTIALS[role]
    setEmail(creds.email)
    setPassword(creds.password)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-10">
          <span
            className="text-3xl font-black tracking-tighter
              text-transparent bg-clip-text
              bg-gradient-to-r from-primary-600 to-accent-600
              dark:from-primary-400 dark:to-accent-500"
          >
            PrepMate
          </span>
        </Link>

        <div
          className="rounded-3xl p-8 border shadow-xl
            bg-white border-slate-200 shadow-slate-200/60
            dark:bg-[#1E1E1E] dark:border-white/[0.08] dark:shadow-black/40"
        >
          <h1 className="text-2xl font-black font-headline text-on-surface dark:text-white mb-1">
            Welcome back
          </h1>
          <p className="text-on-surface-variant dark:text-white/60 mb-8 text-sm">
            Sign in to continue your learning journey.
          </p>

          {/* Demo quick-fill */}
          <div className="flex gap-3 mb-6">
            {(['learner', 'admin'] as DemoRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => fillDemo(role)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all
                  bg-slate-50 border-slate-200 text-on-surface-variant
                  hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50
                  dark:bg-white/5 dark:border-white/[0.08] dark:text-white/50
                  dark:hover:border-primary-400/60 dark:hover:text-primary-300 dark:hover:bg-white/10"
              >
                Demo {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all
                    bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                    focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                    dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                    dark:focus:border-primary-400/70 dark:focus:ring-primary-500/20 dark:focus:bg-white/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-on-surface dark:text-white"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400
                    hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm border outline-none transition-all
                    bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                    focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                    dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                    dark:focus:border-primary-400/70 dark:focus:ring-primary-500/20 dark:focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant
                    hover:text-on-surface dark:hover:text-white transition-colors"
                >
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size="sm" />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="flex flex-col gap-2 p-3 rounded-xl text-sm font-medium
                  bg-red-50 border border-red-200 text-red-700
                  dark:bg-error/10 dark:border-error/30 dark:text-red-400"
              >
                <span className="flex items-center gap-2">
                  <Icon name="error" size="sm" />
                  {error}
                </span>
                {isUnverified && (
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(email)}`}
                    id="login-verify-email-cta"
                    className="inline-flex items-center gap-1.5 font-bold text-primary-600 dark:text-primary-400
                      hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                  >
                    <Icon name="mark_email_read" size="sm" />
                    Verify your email →
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all
                bg-primary-600 hover:bg-primary-500
                shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40
                disabled:opacity-50 disabled:pointer-events-none
                dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-on-surface
                dark:shadow-[0_4px_20px_rgba(187,134,252,0.4)]
                active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="progress_activity" size="sm" className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant dark:text-white/50">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-primary-600 dark:text-primary-400
                hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

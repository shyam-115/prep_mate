import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import Icon from '@components/ui/Icon'

export default function RegisterPage() {
  const { register, user, isLoading } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [showPw, setShowPw]     = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    try {
      await register(name.trim(), email.trim(), password)
      // Redirect to OTP verification page with the email pre-filled
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    }
  }

  const valid = name.trim().length > 0 && email.includes('@') && password.length >= 8 && password === confirm

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl" />
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
            Create your account
          </h1>
          <p className="text-on-surface-variant dark:text-white/60 mb-8 text-sm">
            Join thousands of engineers acing their interviews.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  person
                </span>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all
                    bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                    focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                    dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                    dark:focus:border-primary-400/70 dark:focus:ring-primary-500/20 dark:focus:bg-white/10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  mail
                </span>
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock
                </span>
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface dark:hover:text-white transition-colors"
                >
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size="sm" />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock_reset
                </span>
                <input
                  id="reg-confirm"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all
                    bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                    focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                    dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                    dark:focus:border-primary-400/70 dark:focus:ring-primary-500/20 dark:focus:bg-white/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium
                  bg-red-50 border border-red-200 text-red-700
                  dark:bg-error/10 dark:border-error/30 dark:text-red-400"
              >
                <Icon name="error" size="sm" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !valid}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all mt-2
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
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant dark:text-white/50">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

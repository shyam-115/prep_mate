import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '@components/ui/Icon'
import { authApi } from '@lib/api'
import { useAuth } from '@contexts/AuthContext'

// ─── Password-strength helper ─────────────────────────────────────────────────

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' }
  if (score === 2) return { score, label: 'Fair',   color: 'bg-orange-400' }
  if (score === 3) return { score, label: 'Good',   color: 'bg-yellow-400' }
  return             { score, label: 'Strong', color: 'bg-emerald-500' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { logout } = useAuth() // In case we want to forcefully logout on success

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showPw, setShowPw]       = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const strength  = getStrength(password)
  const mismatch  = confirm.length > 0 && password !== confirm
  const canSubmit = currentPassword.length > 0 && password.length >= 8 && password === confirm && !isLoading

  // Success state
  if (done) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[70vh]">
        <div className="w-full max-w-md relative z-10 animate-fade-in text-center">
          <div className="rounded-3xl p-8 border shadow-xl bg-white border-slate-200 shadow-slate-200/60 dark:bg-[#1E1E1E] dark:border-white/[0.08] dark:shadow-black/40">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <Icon name="check_circle" className="text-emerald-600 dark:text-emerald-400 !text-3xl" />
            </div>
            <h1 className="text-2xl font-black font-headline text-on-surface dark:text-white mb-3">
              Password updated!
            </h1>
            <p className="text-on-surface-variant dark:text-white/60 text-sm mb-8 leading-relaxed">
              Your password has been changed successfully. You have been logged out of all other sessions. Please sign in again.
            </p>
            <button
              onClick={async () => {
                // The API call cleared the refresh cookie.
                // We should formally trigger client-side logout to clear memory token.
                await logout()
                navigate('/', { replace: true })
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all
                bg-primary-600 hover:bg-primary-500
                shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40
                dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-on-surface
                dark:shadow-[0_4px_20px_rgba(187,134,252,0.4)]
                active:scale-[0.98]"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setIsLoading(true)
    try {
      await authApi.changePassword(currentPassword, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password. Please check your current password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[70vh] relative">
      {/* Background gradient orbs (contained) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 rounded-3xl">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent-500/10 dark:bg-accent-500/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="rounded-3xl p-8 border shadow-xl bg-white border-slate-200 shadow-slate-200/60 dark:bg-[#1E1E1E] dark:border-white/[0.08] dark:shadow-black/40">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/app/settings')}
              className="w-10 h-10 rounded-full flex items-center justify-center border text-on-surface-variant hover:text-on-surface hover:bg-slate-50 border-slate-200 transition-all dark:border-white/[0.08] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
            >
              <Icon name="arrow_back" size="sm" />
            </button>
            <div>
              <h1 className="text-xl font-black font-headline text-on-surface dark:text-white">
                Change Password
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Current Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="current-pw"
                  className="block text-sm font-semibold text-on-surface dark:text-white"
                >
                  Current Password
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
                  key
                </span>
                <input
                  id="current-pw"
                  type={showCurrentPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm border outline-none transition-all
                    bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                    focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                    dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                    dark:focus:border-primary-400/70 dark:focus:ring-primary-500/20 dark:focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface dark:hover:text-white transition-colors"
                >
                  <Icon name={showCurrentPw ? 'visibility_off' : 'visibility'} size="sm" />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="reset-new-pw"
                className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock
                </span>
                <input
                  id="reset-new-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
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

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= level
                            ? strength.color
                            : 'bg-slate-200 dark:bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-white/50">
                    Strength:{' '}
                    <span className="font-semibold text-on-surface dark:text-white">
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reset-confirm-pw"
                className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  lock_reset
                </span>
                <input
                  id="reset-confirm-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all
                    bg-slate-50 text-on-surface placeholder:text-on-surface-variant
                    focus:ring-2 focus:bg-white
                    dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:bg-white/10
                    ${
                      mismatch
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20 dark:border-red-500/60 dark:focus:ring-red-500/20'
                        : 'border-slate-200 focus:border-primary-400 focus:ring-primary-500/20 dark:border-white/[0.08] dark:focus:border-primary-400/70 dark:focus:ring-primary-500/20'
                    }`}
                />
              </div>
              {mismatch && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* Server error */}
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
              disabled={!canSubmit}
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
                  Updating…
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

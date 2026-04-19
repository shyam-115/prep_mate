import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Icon from '@components/ui/Icon'
import { authApi } from '@lib/api'

const OTP_LENGTH = 6
const OTP_EXPIRY_SECONDS = 3 * 60  // 3 minutes — must match backend OTP_EXPIRY_MS
const RESEND_COOLDOWN_SECONDS = 60  // 1 min — must match backend OTP_RESEND_COOLDOWN_MS

type PageState = 'idle' | 'verifying' | 'success' | 'locked'

// ── OTP Digit Input Component ─────────────────────────────────────────────────
interface OtpInputProps {
  value: string[]
  onChange: (digits: string[]) => void
  disabled: boolean
  hasError: boolean
}

function OtpInput({ value, onChange, disabled, hasError }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const next = [...value]
        next[index] = ''
        onChange(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const next = [...value]
        next[index - 1] = ''
        onChange(next)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) return

    // Handle paste of multiple digits
    if (raw.length > 1) {
      const digits = raw.slice(0, OTP_LENGTH).split('')
      const next = [...value]
      digits.forEach((d, i) => { if (index + i < OTP_LENGTH) next[index + i] = d })
      onChange(next)
      const focusIdx = Math.min(index + digits.length, OTP_LENGTH - 1)
      inputRefs.current[focusIdx]?.focus()
      return
    }

    const next = [...value]
    next[index] = raw
    onChange(next)
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    onChange(next)
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" role="group" aria-label="6-digit verification code">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={value[i] ?? ''}
          disabled={disabled}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            'w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl border-2 outline-none transition-all duration-150',
            'bg-slate-50 dark:bg-white/5',
            'text-on-surface dark:text-white',
            'caret-primary-500',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            hasError && !disabled
              ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-500/10 animate-shake'
              : value[i]
                ? 'border-primary-500 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-500/10 shadow-sm shadow-primary-500/20'
                : 'border-slate-200 dark:border-white/[0.10] focus:border-primary-400 dark:focus:border-primary-400/80 focus:ring-2 focus:ring-primary-500/20',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

// ── Countdown Timer ───────────────────────────────────────────────────────────
// resetKey: increment this from outside to restart the countdown from scratch.
function useCountdown(seconds: number, resetKey: number) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds) // reset to full whenever key or seconds changes
    const interval = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds, resetKey]) // resetKey change triggers a fresh countdown

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return { remaining, formatted: `${mm}:${ss}` }
}

// ── Page Shell ────────────────────────────────────────────────────────────
// Defined OUTSIDE VerifyEmailPage so React never sees a new component type
// during countdown re-renders. If defined inside, React would unmount+remount
// all children every second, causing input blink and focus loss.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-500/10 dark:bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-500/8 dark:bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Link to="/" className="flex justify-center mb-10">
          <span className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-500">
            PrepMate
          </span>
        </Link>
        <div className="rounded-3xl p-8 border shadow-xl bg-white border-slate-200 shadow-slate-200/60 dark:bg-[#1E1E1E] dark:border-white/[0.08] dark:shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const emailFromQuery = decodeURIComponent(searchParams.get('email') ?? '')

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [pageState, setPageState] = useState<PageState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  // Bumping this restarts the 3-min countdown (happens after each successful resend)
  const [countdownKey, setCountdownKey] = useState(0)

  const otp = digits.join('')
  const otpComplete = otp.length === OTP_LENGTH

  // Expiry countdown — resets whenever countdownKey changes
  const expiry = useCountdown(OTP_EXPIRY_SECONDS, countdownKey)
  const isExpired = expiry.remaining === 0

  // Resend cooldown
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }, [])

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (otpComplete && pageState === 'idle' && !isExpired) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  const handleVerify = async () => {
    if (!otpComplete || pageState === 'verifying') return
    setError(null)
    setPageState('verifying')
    try {
      await authApi.verifyOtp(emailFromQuery, otp)
      setPageState('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed.'
      if (msg.toLowerCase().includes('too many')) {
        setPageState('locked')
      } else {
        setPageState('idle')
        setError(msg)
        // Shake and clear on error
        setDigits(Array(OTP_LENGTH).fill(''))
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resendStatus === 'sending') return
    setResendStatus('sending')
    setError(null)
    try {
      await authApi.resendOtp(emailFromQuery)
      setResendStatus('sent')
      setDigits(Array(OTP_LENGTH).fill(''))
      setPageState('idle')           // ensure inputs are always enabled after resend
      setCountdownKey((k) => k + 1) // restart the 3-min expiry countdown from scratch
      startResendCooldown()
      setTimeout(() => setResendStatus('idle'), 5000)
    } catch (err) {
      setResendStatus('idle')
      const msg = err instanceof Error ? err.message : 'Failed to resend code.'
      setError(msg)
    }
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (pageState === 'success') {
    return (
      <Shell>
        <div className="py-4 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <Icon name="verified" className="text-emerald-600 dark:text-emerald-400 !text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-headline text-on-surface dark:text-white mb-2">
              Email verified!
            </h1>
            <p className="text-on-surface-variant dark:text-white/60 text-sm leading-relaxed">
              Your account is now active. Let's get you set up.
            </p>
          </div>
          <button
            id="otp-continue-btn"
            onClick={() => navigate('/app/onboarding', { replace: true })}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all
              bg-primary-600 hover:bg-primary-500
              shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40
              dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-on-surface
              dark:shadow-[0_4px_20px_rgba(187,134,252,0.4)]
              active:scale-[0.98]"
          >
            Continue to Onboarding
          </button>
        </div>
      </Shell>
    )
  }

  // ── Locked state (too many attempts) ─────────────────────────────────────────
  if (pageState === 'locked') {
    return (
      <Shell>
        <div className="py-4 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
            <Icon name="lock" className="text-red-600 dark:text-red-400 !text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-headline text-on-surface dark:text-white mb-2">
              Too many attempts
            </h1>
            <p className="text-on-surface-variant dark:text-white/60 text-sm leading-relaxed">
              You've entered too many incorrect codes. Request a new one to continue.
            </p>
          </div>
          <button
            id="otp-locked-resend-btn"
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all
              bg-primary-600 hover:bg-primary-500
              shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40
              disabled:opacity-50 disabled:pointer-events-none
              dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-on-surface
              active:scale-[0.98]"
          >
            {resendStatus === 'sending'
              ? <span className="flex items-center justify-center gap-2"><Icon name="progress_activity" size="sm" className="animate-spin" /> Sending…</span>
              : 'Send New Code'}
          </button>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
            <Icon name="arrow_back" size="sm" />
            Back to Sign In
          </Link>
        </div>
      </Shell>
    )
  }

  // ── Main OTP entry state ──────────────────────────────────────────────────────
  return (
    <Shell>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center">
          <Icon name="mark_email_read" className="text-primary-600 dark:text-primary-400 !text-2xl" />
        </div>
        <h1 className="text-2xl font-black font-headline text-on-surface dark:text-white mb-1">
          Check your email
        </h1>
        <p className="text-on-surface-variant dark:text-white/60 text-sm leading-relaxed">
          We sent a 6-digit code to{' '}
          {emailFromQuery
            ? <strong className="text-on-surface dark:text-white break-all">{emailFromQuery}</strong>
            : 'your email address'
          }.
        </p>
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <OtpInput
          value={digits}
          onChange={setDigits}
          disabled={pageState === 'verifying' || isExpired}
          hasError={!!error}
        />
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        <Icon
          name="timer"
          size="sm"
          className={isExpired ? 'text-red-500' : expiry.remaining < 60 ? 'text-amber-500' : 'text-on-surface-variant dark:text-white/40'}
        />
        <span className={`text-sm font-semibold tabular-nums ${isExpired
            ? 'text-red-500'
            : expiry.remaining < 60
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-on-surface-variant dark:text-white/50'
          }`}>
          {isExpired ? 'Code expired' : `Expires in ${expiry.formatted}`}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 mb-4 rounded-xl text-sm font-medium
            bg-red-50 border border-red-200 text-red-700
            dark:bg-error/10 dark:border-error/30 dark:text-red-400"
        >
          <Icon name="error" size="sm" />
          {error}
        </div>
      )}

      {/* Resend sent banner */}
      {resendStatus === 'sent' && (
        <div
          role="status"
          className="flex items-center gap-2 p-3 mb-4 rounded-xl text-sm font-medium
            bg-emerald-50 border border-emerald-200 text-emerald-700
            dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
        >
          <Icon name="check_circle" size="sm" />
          New code sent — check your inbox.
        </div>
      )}

      {/* Verify button (shown when expired or as manual fallback) */}
      {(isExpired || pageState === 'idle') && otpComplete && !isExpired && (
        <button
          id="otp-verify-btn"
          onClick={handleVerify}
          disabled={pageState === 'verifying'}
          className="w-full mb-4 py-3.5 rounded-xl font-bold text-sm text-white transition-all
            bg-primary-600 hover:bg-primary-500
            shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40
            disabled:opacity-50 disabled:pointer-events-none
            dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-on-surface
            dark:shadow-[0_4px_20px_rgba(187,134,252,0.4)]
            active:scale-[0.98]"
        >
          {pageState === 'verifying'
            ? <span className="flex items-center justify-center gap-2"><Icon name="progress_activity" size="sm" className="animate-spin" /> Verifying…</span>
            : 'Verify Code'}
        </button>
      )}

      {pageState === 'verifying' && (
        <div className="w-full mb-4 py-3.5 rounded-xl font-bold text-sm text-white text-center
          bg-primary-600 opacity-70
          dark:bg-primary-500 dark:text-on-surface">
          <span className="flex items-center justify-center gap-2">
            <Icon name="progress_activity" size="sm" className="animate-spin" />
            Verifying…
          </span>
        </div>
      )}

      {/* Resend section */}
      <div className="text-center">
        <p className="text-sm text-on-surface-variant dark:text-white/50 mb-1">
          Didn't receive it?
        </p>
        <button
          id="otp-resend-btn"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resendStatus === 'sending'}
          className="text-sm font-bold transition-colors
            text-primary-600 dark:text-primary-400
            hover:text-primary-500 dark:hover:text-primary-300
            disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {resendStatus === 'sending'
            ? 'Sending…'
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend Code'}
        </button>
      </div>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-bold
            text-on-surface-variant dark:text-white/40
            hover:text-on-surface dark:hover:text-white/70
            transition-colors"
        >
          <Icon name="arrow_back" size="sm" />
          Back to Sign In
        </Link>
      </div>
    </Shell>
  )
}

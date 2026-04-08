import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Icon from '@components/ui/Icon'
import Badge from '@components/ui/Badge'
import { useAuth } from '@contexts/AuthContext'

// ── Delete Account Confirmation Modal ─────────────────────────────────────────
interface DeleteModalProps {
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
}

function DeleteAccountModal({ onClose, onConfirm }: DeleteModalProps) {
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus password field on open
  useEffect(() => { inputRef.current?.focus() }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleConfirm = async () => {
    if (!password) { setError('Please enter your password.'); return }
    setError(null)
    setDeleting(true)
    try {
      await onConfirm(password)
    } catch (err) {
      setDeleting(false)
      setError(err instanceof Error ? err.message : 'Deletion failed. Try again.')
    }
  }

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl border shadow-2xl
        bg-white border-slate-200
        dark:bg-[#1E1E1E] dark:border-white/[0.10]
        animate-fade-in">

        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/[0.06] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <Icon name="delete_forever" className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 id="delete-modal-title" className="text-lg font-black text-on-surface dark:text-white leading-tight">
                Delete Account
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-white/50 mt-0.5">
                This action is permanent and irreversible
              </p>
            </div>
          </div>
          <button
            id="delete-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
            className="text-on-surface-variant hover:text-on-surface dark:hover:text-white transition-colors mt-0.5 flex-shrink-0"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium leading-relaxed">
              Deleting your account will permanently remove:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400/80">
              {['Your profile & personal data', 'All learning progress & streaks', 'Milestones & onboarding data', 'All active sessions'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Icon name="remove_circle" size="sm" className="flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Checkbox confirmation */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              id="delete-confirm-checkbox"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-sm text-on-surface dark:text-white/80 select-none leading-relaxed">
              I understand this is permanent and cannot be undone.
            </span>
          </label>

          {/* Password confirmation */}
          <div>
            <label htmlFor="delete-password-input" className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
              Confirm with your password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
              <input
                ref={inputRef}
                id="delete-password-input"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && confirmed && password) handleConfirm() }}
                placeholder="Enter your current password"
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm border outline-none transition-all
                  bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                  focus:border-red-400 focus:ring-2 focus:ring-red-500/20 focus:bg-white
                  dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                  dark:focus:border-red-400/70 dark:focus:ring-red-500/20 dark:focus:bg-white/10"
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

          {/* Error banner */}
          {error && (
            <div role="alert" className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-700 dark:bg-error/10 dark:border-error/30 dark:text-red-400">
              <Icon name="error" size="sm" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            id="delete-modal-cancel-btn"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border
              border-slate-200 text-on-surface hover:bg-slate-50
              dark:border-white/[0.08] dark:text-white dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            id="delete-modal-confirm-btn"
            onClick={handleConfirm}
            disabled={!confirmed || !password || deleting}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all
              bg-red-600 hover:bg-red-500
              shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40
              disabled:opacity-40 disabled:pointer-events-none
              active:scale-[0.98]"
          >
            {deleting
              ? <span className="flex items-center justify-center gap-2"><Icon name="progress_activity" size="sm" className="animate-spin" /> Deleting…</span>
              : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Profile Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, updateProfile, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [name, setName]           = useState(user?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [saved, setSaved]         = useState(false)
  const [editing, setEditing]     = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }
  }, [])

  if (!user) return null

  const handleSave = () => {
    updateProfile({ name, avatarUrl })
    setEditing(false)
    setSaved(true)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000)
  }

  const handleDeleteAccount = async (password: string) => {
    await deleteAccount(password)
    // Session is already cleared inside deleteAccount(); navigate to home
    navigate('/', { replace: true })
  }

  const stats = [
    { label: 'Day Streak',       value: '14',  icon: 'local_fire_department', color: 'text-accent-500 dark:text-accent-400' },
    { label: 'Problems Solved',  value: '142', icon: 'check_circle',           color: 'text-primary-600 dark:text-primary-400' },
    { label: 'Concepts Learned', value: '38',  icon: 'school',                 color: 'text-green-600 dark:text-green-400' },
    { label: 'Hours Practiced',  value: '56',  icon: 'schedule',               color: 'text-orange-600 dark:text-orange-400' },
  ]

  return (
    <>
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      <header className="mb-10">
        <h1 className="text-3xl font-black font-headline text-on-surface dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-on-surface-variant dark:text-white/60 mt-1">
          Manage your personal information and progress.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar + Identity */}
        <div className="lg:col-span-1">
          <Card variant="elevated" className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-5">
              <img
                src={editing ? avatarUrl : user.avatarUrl}
                alt={user.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                }}
                className="w-full h-full rounded-full object-cover border-4 border-primary-200 dark:border-primary-400/40 shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                <Icon name="verified" size="sm" className="text-white dark:text-on-surface" />
              </span>
            </div>

            <h2 className="text-xl font-black font-headline text-on-surface dark:text-white">{user.name}</h2>
            <p className="text-sm text-on-surface-variant dark:text-white/60 mt-1 mb-3">{user.email}</p>

            <Badge
              label={user.role === 'ADMIN' ? 'Admin' : 'Learner'}
              variant={user.role === 'ADMIN' ? 'secondary' : 'primary'}
              className="mb-5"
            />

            <div className="text-xs text-on-surface-variant dark:text-white/40 border-t border-slate-200 dark:border-white/[0.06] pt-4">
              Member since <strong className="text-on-surface dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</strong>
            </div>

            <button
              id="profile-sign-out-btn"
              onClick={() => logout()}
              className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                border border-slate-200 text-on-surface-variant hover:bg-slate-50 hover:border-slate-300
                dark:border-white/[0.08] dark:text-white/60 dark:hover:bg-white/5"
            >
              Sign Out
            </button>
          </Card>
        </div>

        {/* Right: Info + Stats + Danger Zone */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Edit form */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface dark:text-white">Personal Information</h3>
              {!editing && (
                <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {saved && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium
                bg-green-50 border border-green-200 text-green-700
                dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400">
                <Icon name="check_circle" size="sm" />
                Profile saved!
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                  Display Name
                </label>
                {editing ? (
                  <input
                    id="profile-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all
                      bg-slate-50 border-slate-200 text-on-surface
                      focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                      dark:bg-white/5 dark:border-white/[0.08] dark:text-white
                      dark:focus:border-primary-400/70 dark:focus:bg-white/10"
                  />
                ) : (
                  <p className="text-on-surface dark:text-white/90 font-medium">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                  Email
                </label>
                <p className="text-on-surface-variant dark:text-white/60 font-medium">{user.email}</p>
              </div>

              {editing && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface dark:text-white mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    id="profile-avatar-input"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all
                      bg-slate-50 border-slate-200 text-on-surface placeholder:text-on-surface-variant
                      focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white
                      dark:bg-white/5 dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/40
                      dark:focus:border-primary-400/70 dark:focus:bg-white/10"
                  />
                </div>
              )}

              {editing && (
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim()}>
                    Save Changes
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setName(user.name); setAvatarUrl(user.avatarUrl || '') }}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Stats */}
          <Card variant="surface-low">
            <h3 className="font-bold text-lg text-on-surface dark:text-white mb-6">Learning Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl
                    bg-slate-50 border border-slate-200
                    dark:bg-white/5 dark:border-white/[0.06]"
                >
                  <Icon name={s.icon} className={`${s.color} !text-2xl`} />
                  <span className="text-2xl font-black text-on-surface dark:text-white">{s.value}</span>
                  <span className="text-xs font-semibold text-on-surface-variant dark:text-white/50 text-center leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger Zone */}
          <div className="rounded-2xl border-2 border-red-200 dark:border-red-500/25 bg-red-50/50 dark:bg-red-500/5 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="warning" className="text-red-600 dark:text-red-400" size="sm" />
              <h3 className="font-bold text-base text-red-700 dark:text-red-400">Danger Zone</h3>
            </div>
            <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4 leading-relaxed">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              id="profile-delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                border-2 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400
                dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/15 dark:hover:border-red-500/60
                active:scale-[0.98]"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

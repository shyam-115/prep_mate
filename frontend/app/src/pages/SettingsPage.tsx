import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Icon from '@components/ui/Icon'
import { useTheme } from '@contexts/ThemeContext'

type TabId = 'appearance' | 'notifications' | 'account'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'appearance',    label: 'Appearance',    icon: 'palette'  },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'account',       label: 'Account',       icon: 'manage_accounts' },
]

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group select-none">
      <span className="text-sm font-medium text-on-surface dark:text-white/90">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={[
          'relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1',
          checked
            ? 'bg-primary-600 dark:bg-primary-500 shadow-[0_0_12px_rgba(187,134,252,0.4)]'
            : 'bg-slate-300 dark:bg-white/20',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabId>('appearance')
  const [notifs, setNotifs] = useState({
    email:    true,
    streaks:  true,
    updates:  false,
    tips:     true,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      <header className="mb-10">
        <h1 className="text-3xl font-black font-headline text-on-surface dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-on-surface-variant dark:text-white/60 mt-1 text-sm">
          Manage your preferences and account settings.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab nav */}
        <nav className="flex lg:flex-col gap-1 min-w-[180px]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left',
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/15 dark:text-primary-300 dark:border-primary-500/30'
                  : 'border-transparent text-on-surface-variant hover:bg-slate-100 hover:text-on-surface dark:hover:bg-white/5 dark:hover:text-white',
              ].join(' ')}
            >
              <Icon name={tab.icon} size="sm" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {/* Appearance */}
          {activeTab === 'appearance' && (
            <Card>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-6">Theme</h2>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={[
                      'flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200',
                      theme === t
                        ? 'bg-primary-50 border-primary-400 text-primary-700 shadow-md dark:bg-primary-500/15 dark:border-primary-400/60 dark:text-primary-300 dark:shadow-[0_0_20px_rgba(187,134,252,0.2)]'
                        : 'bg-slate-50 border-slate-200 text-on-surface-variant hover:border-slate-300 dark:bg-white/5 dark:border-white/[0.08] dark:text-white/60 dark:hover:border-white/15',
                    ].join(' ')}
                  >
                    <Icon
                      name={t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'brightness_auto'}
                      className="!text-2xl"
                    />
                    <span className="text-xs font-bold capitalize">{t}</span>
                    {theme === t && (
                      <Icon name="check_circle" size="sm" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-6">Notification Preferences</h2>
              <div className="space-y-5">
                <Toggle checked={notifs.email}   onChange={() => toggleNotif('email')}   label="Email summaries & progress reports" />
                <div className="border-t border-slate-200 dark:border-white/[0.06]" />
                <Toggle checked={notifs.streaks} onChange={() => toggleNotif('streaks')} label="Daily streak reminders" />
                <div className="border-t border-slate-200 dark:border-white/[0.06]" />
                <Toggle checked={notifs.updates} onChange={() => toggleNotif('updates')} label="Product updates and new features" />
                <div className="border-t border-slate-200 dark:border-white/[0.06]" />
                <Toggle checked={notifs.tips}    onChange={() => toggleNotif('tips')}    label="Learning tips and recommendations" />
              </div>
            </Card>
          )}

          {/* Account */}
          {activeTab === 'account' && (
            <Card>
              <h2 className="text-lg font-bold text-on-surface dark:text-white mb-2">Account</h2>
              <p className="text-sm text-on-surface-variant dark:text-white/60 mb-8">
                Manage your account data and privacy.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/app/settings/change-password')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                    border-slate-200 text-on-surface hover:bg-slate-50
                    dark:border-white/[0.08] dark:text-white/80 dark:hover:bg-white/5"
                >
                  <Icon name="password" size="sm" className="text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="text-sm font-semibold">Change Password</div>
                    <div className="text-xs text-on-surface-variant dark:text-white/40">Update your account password securely</div>
                  </div>
                  <Icon name="chevron_right" size="sm" className="ml-auto text-on-surface-variant" />
                </button>

                <button
                  className="w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                    border-slate-200 text-on-surface hover:bg-slate-50
                    dark:border-white/[0.08] dark:text-white/80 dark:hover:bg-white/5"
                >
                  <Icon name="download" size="sm" className="text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="text-sm font-semibold">Export my data</div>
                    <div className="text-xs text-on-surface-variant dark:text-white/40">Download all your learning data as JSON</div>
                  </div>
                  <Icon name="chevron_right" size="sm" className="ml-auto text-on-surface-variant" />
                </button>

                <div className="border-t border-slate-200 dark:border-white/[0.06] pt-4">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                      border-red-200 text-red-700 hover:bg-red-50
                      dark:border-error/30 dark:text-red-400 dark:hover:bg-error/10"
                  >
                    <Icon name="delete_forever" size="sm" />
                    <div>
                      <div className="text-sm font-semibold">Delete account</div>
                      <div className="text-xs opacity-70">This action cannot be undone.</div>
                    </div>
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 shadow-2xl
              bg-white border border-slate-200
              dark:bg-[#1E1E1E] dark:border-white/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mb-4 rounded-2xl bg-red-50 dark:bg-error/10 flex items-center justify-center">
              <Icon name="delete_forever" className="text-red-500 !text-2xl" />
            </div>
            <h3 className="text-xl font-black text-on-surface dark:text-white mb-2">Delete Account?</h3>
            <p className="text-sm text-on-surface-variant dark:text-white/60 mb-8 leading-relaxed">
              All your data, progress, and streak history will be permanently erased. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-all
                  border-slate-200 text-on-surface hover:bg-slate-50
                  dark:border-white/[0.08] dark:text-white/80 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all
                  bg-red-600 hover:bg-red-500
                  dark:bg-error dark:hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

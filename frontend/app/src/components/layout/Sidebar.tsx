import { NavLink, useNavigate } from 'react-router-dom'
import type { NavItem, SidebarFooterItem } from '@types-app/index'
import Icon from '@components/ui/Icon'
import { useAuth } from '@contexts/AuthContext'

interface SidebarProps {
  workspaceTitle?: string
  workspaceSubtitle?: string
  items?: NavItem[]
  footerItems?: SidebarFooterItem[]
  showUpgradeCTA?: boolean
  isOpen?: boolean
  onClose?: () => void
}

const defaultItems: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: 'dashboard', end: true },
  { label: 'Library',   href: '/library',        icon: 'local_library', end: true },
  { label: 'Practice',  href: '/app/practice',   icon: 'code', end: true },
  { label: 'Concepts',  href: '/app/learn/concepts', icon: 'school', end: true },
  { label: 'Deep Dive', href: '/app/practice/deep-dive', icon: 'shutter_speed', end: true },
  { label: 'Community', href: '/app/community',  icon: 'groups', end: true },
]

const defaultFooterItems: SidebarFooterItem[] = [
  { label: 'Help Center', href: '#', icon: 'help_outline' },
  { label: 'Log Out', href: '#', icon: 'logout', danger: true },
]

export default function Sidebar({
  workspaceTitle = 'Workspace',
  workspaceSubtitle = 'Interview Prep',
  items = defaultItems,
  footerItems = defaultFooterItems,
  showUpgradeCTA = true,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[65px] bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed lg:sticky top-[65px] left-0 h-[calc(100vh-65px)] w-64 z-40',
          'flex flex-col flex-shrink-0',
          'transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Light
          'bg-white border-r border-slate-200 shadow-[1px_0_8px_rgba(15,23,42,0.05)]',
          // Dark
          'dark:bg-[#1A1A1A] dark:border-r dark:border-white/[0.06]',
        ].join(' ')}
      >
        {/* ── Workspace header ─────────────────────────── */}
        <div className="px-5 pt-6 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 dark:from-primary-500 dark:to-accent-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Icon name="bolt" size="sm" className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-on-surface dark:text-white font-headline tracking-tight leading-tight truncate">
                {workspaceTitle}
              </h2>
              <p className="text-[11px] text-on-surface-variant dark:text-white/40 font-medium truncate mt-0.5">
                {workspaceSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* ── Nav items ────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-3 flex flex-col"
          aria-label="Sidebar navigation"
        >
          {items.map((item, idx) =>
            item.isSection ? (
              /* Section label */
              <p
                key={`section-${idx}`}
                className="px-2 pt-5 pb-1.5 first:pt-2 text-[10px] font-black uppercase tracking-[0.14em] text-on-surface-variant/50 dark:text-white/25 select-none"
              >
                {item.label}
              </p>
            ) : (
              /* Nav link */
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border mb-0.5',
                    isActive
                      ? [
                          'bg-primary-50 text-primary-700 border-primary-200 shadow-sm',
                          'dark:bg-primary-500/15 dark:text-primary-300 dark:border-primary-500/30',
                          'dark:shadow-[0_0_12px_rgba(187,134,252,0.15)]',
                        ].join(' ')
                      : [
                          'border-transparent text-on-surface-variant dark:text-white/60',
                          'hover:bg-slate-50 hover:text-on-surface hover:border-slate-200/80',
                          'dark:hover:bg-white/[0.06] dark:hover:text-white dark:hover:border-white/[0.08]',
                        ].join(' '),
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {item.icon && (
                      <span
                        className={[
                          'w-5 h-5 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                          isActive
                            ? 'text-primary-600 dark:text-primary-300'
                            : 'text-on-surface-variant/70 dark:text-white/40 group-hover:text-on-surface dark:group-hover:text-white',
                        ].join(' ')}
                      >
                        <Icon name={item.icon} size="sm" />
                      </span>
                    )}
                    <span className="leading-none">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 shadow-[0_0_6px_rgba(187,134,252,0.6)] flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* ── Footer ───────────────────────────────────── */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-100 dark:border-white/[0.06] flex flex-col gap-2">
          {showUpgradeCTA && (
            <button
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-[0.98]
                bg-gradient-to-r from-primary-600 to-accent-600
                hover:from-primary-500 hover:to-accent-500
                shadow-md shadow-primary-500/20
                dark:shadow-[0_4px_20px_rgba(187,134,252,0.25)]
                dark:hover:shadow-[0_6px_28px_rgba(187,134,252,0.4)]"
            >
              ✦ Upgrade to Pro
            </button>
          )}

          <div className="flex flex-col gap-0.5">
            {footerItems.map((item) =>
              item.danger ? (
                <button
                  key={item.label}
                  onClick={() => {
                    logout()
                    navigate('/')
                    onClose?.()
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm border border-transparent transition-all duration-200 w-full text-left
                    text-error hover:bg-error/8 dark:hover:bg-error/15 dark:text-red-400 dark:hover:text-red-300"
                >
                  <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size="sm" />
                  </span>
                  {item.label}
                </button>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm border border-transparent transition-all duration-200
                    text-on-surface-variant dark:text-white/50
                    hover:bg-slate-50 hover:text-on-surface hover:border-slate-100
                    dark:hover:bg-white/[0.05] dark:hover:text-white dark:hover:border-white/[0.06]"
                >
                  <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size="sm" />
                  </span>
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import type { NavItem } from '@types-app/index'
import Icon from '@components/ui/Icon'
import ThemeToggle from '@components/ui/ThemeToggle'
import { useAuth } from '@contexts/AuthContext'

interface NavbarProps {
  logoText?: string
  navLinks?: NavItem[]
  showSearch?: boolean
  onMenuClick?: () => void
}

const defaultNavLinks: NavItem[] = [
  { label: 'Home',      href: '/#' },
  { label: 'Library',   href: '/library' },
  { label: 'Practice',  href: '/practice' },
  { label: 'Community', href: '/community' },
]

export default function Navbar({
  logoText = 'PrepMate',
  navLinks = defaultNavLinks,
  showSearch = true,
  onMenuClick,
}: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={[
        'w-full top-0 sticky z-50 transition-all duration-300',
        'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm',
        'dark:bg-[#121212]/95 dark:border-white/[0.06] dark:shadow-[0_1px_32px_rgba(0,0,0,0.6)]',
      ].join(' ')}
    >
      {/* Full-width inner with consistent edge padding */}
      <nav className="w-full flex items-center px-4 md:px-6 lg:px-8 h-[65px] gap-4">

        {/* ── Left: Hamburger + Logo ──────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-1 rounded-xl transition-colors
              text-on-surface-variant hover:bg-slate-100 hover:text-on-surface
              dark:hover:bg-white/[0.06] dark:hover:text-white"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Icon name="menu" size="sm" />
          </button>

          <NavLink
            to="/"
            className="text-4xl font-black tracking-tighter font-headline
              text-transparent bg-clip-text
              bg-gradient-to-r from-primary-600 to-accent-600
              dark:from-primary-400 dark:to-accent-400
              hover:opacity-80 transition-opacity whitespace-nowrap select-none"
          >
            {logoText}
          </NavLink>
        </div>

        {/* ── Centre: optional public nav links ──────── */}
        {navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  [
                    'px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-primary-600 bg-primary-50 dark:text-primary-300 dark:bg-primary-500/15'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* ── Search: grows to fill available space ───── */}
        <div className="flex-1 flex justify-center px-2 md:px-6">
          {showSearch && (
            <div
              className={[
                'relative transition-all duration-300',
                searchFocused ? 'w-full max-w-xl' : 'w-full max-w-xs md:max-w-sm',
              ].join(' ')}
            >
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Search topics, concepts..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={[
                  'w-full pl-10 pr-4 py-3 rounded-full text-sm outline-none transition-all duration-300',
                  'bg-slate-100 text-on-surface placeholder:text-on-surface-variant/70',
                  'border border-transparent focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/20 focus:bg-white',
                  'dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40',
                  'dark:border-transparent dark:focus:border-primary-400/50 dark:focus:ring-primary-500/15 dark:focus:bg-white/[0.1]',
                ].join(' ')}
              />
            </div>
          )}
        </div>

        {/* ── Right: Actions ──────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />

          {/* Notifications */}
          {user && (
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-xl transition-all duration-200
                text-on-surface-variant hover:text-primary-600 hover:bg-slate-100
                dark:hover:text-primary-400 dark:hover:bg-white/[0.06]
                active:scale-90"
            >
              <Icon name="notifications" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full border-2 border-white dark:border-[#121212]" />
            </button>
          )}

          {/* Avatar dropdown OR Sign In */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer
                  border-2 border-primary-200 dark:border-primary-400/40
                  ring-2 ring-transparent hover:ring-primary-500/40
                  dark:hover:ring-primary-400/40 transition-all duration-300"
              >
                <img
                  src={user.avatarUrl}
                  alt={`${user.name} avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-xl overflow-hidden
                    bg-white border-slate-200 shadow-slate-200/80
                    dark:bg-[#1E1E1E] dark:border-white/[0.08] dark:shadow-black/60
                    animate-fade-in"
                >
                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <p className="text-sm font-bold text-on-surface dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-on-surface-variant dark:text-white/50 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                      bg-primary-50 text-primary-700 border border-primary-200
                      dark:bg-primary-500/15 dark:text-primary-300 dark:border-primary-500/30">
                      {user.role}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <Link
                      to="/app/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        text-on-surface-variant hover:text-on-surface hover:bg-slate-100
                        dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.06]"
                    >
                      <Icon name="dashboard" size="sm" />
                      Dashboard
                    </Link>
                    <Link
                      to="/app/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        text-on-surface-variant hover:text-on-surface hover:bg-slate-100
                        dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.06]"
                    >
                      <Icon name="person" size="sm" />
                      My Profile
                    </Link>
                    <Link
                      to="/app/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        text-on-surface-variant hover:text-on-surface hover:bg-slate-100
                        dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.06]"
                    >
                      <Icon name="settings" size="sm" />
                      Settings
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                          text-on-surface-variant hover:text-on-surface hover:bg-slate-100
                          dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.06]"
                      >
                        <Icon name="admin_panel_settings" size="sm" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-slate-100 dark:border-white/[0.06] my-1" />
                    <button
                      onClick={() => {
                        logout()
                        navigate('/')
                        setDropdownOpen(false)
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                        text-red-500 hover:bg-red-50
                        dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Icon name="logout" size="sm" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="h-9 px-5 rounded-full font-semibold text-sm flex-shrink-0 transition-all duration-200 inline-flex items-center
                bg-primary-600 hover:bg-primary-500 text-white
                shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40
                dark:bg-primary-500 dark:hover:bg-primary-400
                dark:shadow-[0_4px_16px_rgba(187,134,252,0.4)] dark:hover:shadow-[0_6px_24px_rgba(187,134,252,0.6)]
                active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

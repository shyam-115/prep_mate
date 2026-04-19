import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileBottomBar from './MobileBottomBar'
import type { NavItem, SidebarFooterItem } from '@types-app/index'

// ─── Section-grouped sidebar sitemap ─────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  // ── Overview ──────────────────────────────────────
  { label: 'Overview',          href: '#',                       isSection: true, icon: '' },
  { label: 'Dashboard',         href: '/app/dashboard',          icon: 'dashboard',     end: true },

  // ── Learn ─────────────────────────────────────────
  { label: 'Learn',             href: '#',                       isSection: true, icon: '' },
  { label: 'Library',           href: '/library',                icon: 'local_library', end: true },
  { label: 'Concepts',          href: '/app/learn/concepts',     icon: 'school',        end: true },


  // ── Practice ──────────────────────────────────────
  { label: 'Practice',          href: '#',                       isSection: true, icon: '' },
  { label: 'Interview Questions',href: '/app/practice',          icon: 'code',          end: true },
  { label: 'Deep Dive',         href: '/app/practice/deep-dive', icon: 'shutter_speed', end: true },

  // ── Community ─────────────────────────────────────
  { label: 'Community',         href: '#',                       isSection: true, icon: '' },
  { label: 'Community',         href: '/app/community',          icon: 'groups',        end: true },
]

const MOBILE_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: 'dashboard'     },
  { label: 'Library',   href: '/library',        icon: 'local_library' },
  { label: 'Practice',  href: '/app/practice',   icon: 'code'          },
  { label: 'Community', href: '/app/community',  icon: 'groups'        },
  { label: 'Profile',   href: '/app/profile',    icon: 'person'        },
]

const FOOTER_ITEMS: SidebarFooterItem[] = [
  { label: 'Help Center', href: '#', icon: 'help_outline' },
  { label: 'Log Out',     href: '#', icon: 'logout', danger: true },
]

// ─── Layout component ─────────────────────────────────────────────────────────

/**
 * AppLayout — wraps all authenticated learner routes under /app/**.
 * Renders once; individual pages render via <Outlet />.
 * Auth guard is centralised here — no per-route <ProtectedRoute> needed.
 */
export default function AppLayout({ requireAuth = true }: { requireAuth?: boolean }) {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isFullNavbarPage = location.pathname.startsWith('/app/community') || location.pathname.startsWith('/app/practice') || location.pathname.startsWith('/app/practice/deep-dive')

  // ── Auth guard ─────────────────────────────────────────────────────────
  if (requireAuth && !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Define top nav items to show when sidebar is hidden
  const topNavItems = isFullNavbarPage ? [
    { label: 'Dashboard', href: '/app/dashboard' },
    { label: 'Library',   href: '/library' },
    { label: 'Practice',  href: '/app/practice' },
    { label: 'Community', href: '/app/community' },
  ] : []

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar
        navLinks={topNavItems}
        showSearch
        onMenuClick={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <div className="flex w-full min-h-[calc(100vh-65px)]">
        {!isFullNavbarPage && (
          <Sidebar
            items={NAV_ITEMS}
            footerItems={user ? FOOTER_ITEMS : [FOOTER_ITEMS[0]]}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            workspaceTitle="PrepMate"
            workspaceSubtitle="Interview Prep"
            showUpgradeCTA
          />
        )}

        {/* Page content */}
        <main className={`flex-1 min-w-0 pb-24 lg:pb-10 overflow-x-hidden ${isFullNavbarPage ? 'p-0' : 'p-6 lg:p-10'}`}>
          <div className={isFullNavbarPage ? 'max-w-7xl mx-auto p-6 lg:p-10' : ''}>
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomBar items={MOBILE_ITEMS} />
    </div>
  )
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { HiHome, HiMusicNote, HiFilm, HiCog, HiLogout } from 'react-icons/hi'

export default function AdminLayout() {
  const { t } = useTranslation()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const links = [
    { to: '/admin', label: t('admin.dashboard'), icon: HiHome, end: true },
    { to: '/admin/surahs', label: t('admin.surahs'), icon: HiMusicNote },
    { to: '/admin/clips', label: t('admin.clips'), icon: HiFilm },
    { to: '/admin/settings', label: t('admin.settings'), icon: HiCog },
  ]

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 glass border-r border-white/5 dark:border-white/5 border-gray-200 flex flex-col">
        <div className="p-4 border-b border-white/5 dark:border-white/5 border-gray-200">
          <h2 className="font-heading text-lg font-semibold text-gold">{t('admin.dashboard')}</h2>
          <p className="text-xs text-gray-500 mt-1">Sacred Echoes</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 dark:border-white/5 border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
          >
            <HiLogout className="w-5 h-5" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

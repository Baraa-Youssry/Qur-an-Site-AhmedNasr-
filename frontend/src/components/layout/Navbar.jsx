import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HiMenu, HiX } from 'react-icons/hi'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageToggle from '../ui/LanguageToggle'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/library', label: t('nav.library') },
    { to: '/azkar', label: t('nav.azkar') },
    { to: '/clips', label: t('nav.clips') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-navy/80 dark:bg-navy/80 bg-white/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-emerald flex items-center justify-center">
              <span className="text-navy font-bold text-sm">قرآن</span>
            </div>
            <span className="font-heading font-semibold text-gold hidden sm:block">
              {i18n.language === 'ar' ? 'أحمد عبد الرازق نصر' : 'Ahmed Abdelrazek Nasr'}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gold dark:hover:text-white hover:bg-gold/5 dark:hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl bg-navy/40 dark:bg-white/5 hover:bg-gold/10 transition-colors"
            >
              {mobileOpen ? (
                <HiX className="w-5 h-5 text-gold" />
              ) : (
                <HiMenu className="w-5 h-5 text-gold" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200/60 dark:border-white/5 pb-4">
          <div className="px-4 pt-2 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gold dark:hover:text-white hover:bg-gold/5 dark:hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

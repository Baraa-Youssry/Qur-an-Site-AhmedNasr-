import { useTranslation } from 'react-i18next'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function ThemeToggle() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const toggle = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-gold/10 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <FiSun className="w-4 h-4 hidden dark:block text-gold" />
      <FiMoon className="w-4 h-4 block dark:hidden text-gray-600" />
    </button>
  )
}

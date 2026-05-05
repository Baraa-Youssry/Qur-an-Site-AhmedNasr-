import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-gold/10 transition-all duration-300 font-heading text-sm text-gold"
    >
      {i18n.language === 'ar' ? 'EN' : 'عربي'}
    </button>
  )
}

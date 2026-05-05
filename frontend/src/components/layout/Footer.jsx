import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getSocialLinks, getSettings } from '../../services/api'
import { FaYoutube, FaInstagram, FaFacebook, FaTwitter, FaTiktok, FaTelegram } from 'react-icons/fa'
import { HiMail } from 'react-icons/hi'

const platformIcons = {
  youtube: FaYoutube,
  instagram: FaInstagram,
  facebook: FaFacebook,
  twitter: FaTwitter,
  tiktok: FaTiktok,
  telegram: FaTelegram,
  email: HiMail,
}

export default function Footer() {
  const { t, i18n } = useTranslation()

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
  })

  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-links'],
    queryFn: getSocialLinks,
    staleTime: 10 * 60 * 1000,
  })

  const name = i18n.language === 'ar' ? settings?.reciter_name_ar : settings?.reciter_name_en

  return (
    <footer className="border-t border-gray-200/60 dark:border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-start">
            <p className="font-heading text-gold font-semibold">{name || 'Ahmed Abdelrazek Nasr'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-gray-400 mt-1">
              &copy; {new Date().getFullYear()} {t('nav.home')}
            </p>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = platformIcons[link.platform?.toLowerCase()] || HiMail
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-navy/30 dark:bg-white/5 hover:bg-gold/10 hover:text-gold transition-all duration-300 text-gray-400 dark:text-gray-400"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

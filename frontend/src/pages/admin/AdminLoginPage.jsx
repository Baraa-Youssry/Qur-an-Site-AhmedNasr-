import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { login } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login({ email, password })
      setAuth(data.token, data.user)
      toast.success(t('admin.login'))
      navigate('/admin')
    } catch (err) {
      console.error('Login failed:', err)
      const message = err.response?.data?.error || t('common.error')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('admin.login')} - Sacred Echoes</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light to-navy dark:from-navy dark:via-navy-light dark:to-navy from-gray-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gold rounded-full blur-[96px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-emerald items-center justify-center mb-4">
              <span className="text-navy font-bold text-xl font-arabic">قرآن</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white dark:text-white text-gray-900">
              {t('admin.dashboard')}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="glass-card space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-1">
                {t('admin.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-1">
                {t('admin.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('admin.login_btn')}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

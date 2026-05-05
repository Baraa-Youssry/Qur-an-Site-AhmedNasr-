import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useThemeStore } from './store/themeStore'

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import SurahDetailPage from './pages/SurahDetailPage'
import FeaturedClipsPage from './pages/FeaturedClipsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import AzkarPage from './pages/AzkarPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSurahs from './pages/admin/AdminSurahs'
import AdminClips from './pages/admin/AdminClips'
import AdminSettings from './pages/admin/AdminSettings'
import AdminLayout from './components/admin/AdminLayout'
import AdminGuard from './hooks/useAdmin.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  const { i18n } = useTranslation()
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <Toaster
            position={i18n.language === 'ar' ? 'top-left' : 'top-right'}
            toastOptions={{
              className: '!bg-navy-light !text-white !border !border-white/10',
              duration: 3000,
            }}
          />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="surah/:id" element={<SurahDetailPage />} />
              <Route path="clips" element={<FeaturedClipsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="azkar" element={<AzkarPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="surahs" element={<AdminSurahs />} />
              <Route path="clips" element={<AdminClips />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  )
}

export default App

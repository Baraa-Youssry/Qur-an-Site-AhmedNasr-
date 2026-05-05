import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import PersistentPlayer from '../player/PersistentPlayer'
import ScrollToTop from '../ui/ScrollToTop'

export default function Layout() {
  const location = useLocation()
  const isSurahPage = location.pathname.startsWith('/surah/')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isSurahPage && <Footer />}
      <PersistentPlayer />
      <ScrollToTop />
    </div>
  )
}

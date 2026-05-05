import { useEffect, useState } from 'react'
import { FiArrowUp } from 'react-icons/fi'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full bg-gold/90 hover:bg-gold text-navy flex items-center justify-center shadow-lg shadow-gold/20 transition-all duration-300 animate-fade-in"
    >
      <FiArrowUp className="w-5 h-5" />
    </button>
  )
}

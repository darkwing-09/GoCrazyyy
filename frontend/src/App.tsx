import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ThemeProvider } from '@/lib/theme'
import { AppDataProvider } from '@/lib/app-data'
import { Background } from '@/components/Background'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Categories } from '@/pages/Categories'
import { Product } from '@/pages/Product'
import { Daily, DailyDay } from '@/pages/Daily'
import { About } from '@/pages/About'
import { Rules, FAQ, Terms, Refunds, Privacy, Contact } from '@/pages/Legal'
import { NotFound } from '@/pages/NotFound'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) { document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }); return }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

function Pages() {
  const location = useLocation()
  // Keep the board family on one key so switching tabs/categories animates the content, not the whole page.
  const key = location.pathname.startsWith('/category') || ['/', '/today', '/deals'].includes(location.pathname) ? 'board' : location.pathname
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={key}>
        <Route path="/" element={<Home tab="alltime" />} />
        <Route path="/today" element={<Home tab="today" />} />
        <Route path="/deals" element={<Home tab="deals" />} />
        <Route path="/category/:slug" element={<Home tab="alltime" />} />
        <Route path="/category/:slug/today" element={<Home tab="today" />} />
        <Route path="/category/:slug/deals" element={<Home tab="deals" />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/daily/:day" element={<DailyDay />} />
        <Route path="/about" element={<About />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Background />
          <div className="flex min-h-dvh flex-col">
            <Header />
            <Pages />
            <Footer />
          </div>
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  )
}

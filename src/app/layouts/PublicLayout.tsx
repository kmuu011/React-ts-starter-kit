import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import GlobalSpinner from '@/components/ui/GlobalSpinner'
import ToastMessage from '@/components/ui/ToastMessage'
import GlobalModal from '@/components/ui/GlobalModal'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalSpinner />
      <ToastMessage />
      <GlobalModal />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

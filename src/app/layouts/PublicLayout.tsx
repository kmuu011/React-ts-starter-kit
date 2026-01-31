import { Outlet } from 'react-router-dom'
import Header from '@/shared/components/layout/Header'
import Footer from '@/shared/components/layout/Footer'
import GlobalSpinner from '@/shared/components/ui/GlobalSpinner'
import ToastMessage from '@/shared/components/ui/ToastMessage'
import GlobalModal from '@/shared/components/ui/GlobalModal'

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

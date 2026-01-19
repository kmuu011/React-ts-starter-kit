import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import LoginPage from '../../features/auth/pages/login'

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        path: '/',
        element: <PublicLayout />,
        // element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
])

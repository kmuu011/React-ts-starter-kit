import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import LoginPage from '../../features/auth/pages/login'
import SignupPage from '../../features/auth/pages/signup'
import MemoListPage from '../../features/memo/pages/list'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        path: '/',
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/memo/list',
        element: <MemoListPage />,
      },
    ],
  },
])

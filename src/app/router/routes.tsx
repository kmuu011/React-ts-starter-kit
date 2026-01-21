import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import LoginPage from '../../features/auth/pages/login'
import SignupPage from '../../features/auth/pages/signup'
import MemoListPage from '../../features/memo/pages/list'
import MemoDetailPage from '../../features/memo/pages/detail'
import MemoCreatePage from '../../features/memo/pages/create'
import MemoEditPage from '../../features/memo/pages/edit'

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
      {
        path: '/memo/create',
        element: <MemoCreatePage />,
      },
      {
        path: '/memo/:memoIdx',
        element: <MemoDetailPage />,
      },
      {
        path: '/memo/:memoIdx/edit',
        element: <MemoEditPage />,
      },
    ],
  },
])

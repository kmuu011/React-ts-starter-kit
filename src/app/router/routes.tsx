import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import LoginPage from '../../features/auth/pages/LoginPage'
import SignupPage from '../../features/auth/pages/SignupPage'
import MemoListPage from '../../features/memo/pages/ListPage'
import MemoDetailPage from '../../features/memo/pages/DetailPage'
import MemoCreatePage from '../../features/memo/pages/CreatePage'
import MemoEditPage from '../../features/memo/pages/EditPage'

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

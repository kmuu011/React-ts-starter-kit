import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import LoginPage from '../../features/auth/pages/Login'
import SignupPage from '../../features/auth/pages/Signup'
import MemoListPage from '../../features/memo/pages/List'
import MemoDetailPage from '../../features/memo/pages/Detail'
import MemoCreatePage from '../../features/memo/pages/Create'
import MemoEditPage from '../../features/memo/pages/Edit'
import LexicalTestPage from '../../features/test/pages/LexicalTest'

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
      {
        path: '/test/lexical',
        element: <LexicalTestPage />,
      },
    ],
  },
])

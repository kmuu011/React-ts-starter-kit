import { Link, NavLink } from 'react-router-dom'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* 로고 */}
        <Link to={ROUTER_PATHS.ROOT} className="text-lg font-bold text-slate-900">
          Welcome to React
        </Link>

        {/* 메뉴 */}
        <nav className="flex items-center gap-2 text-sm">
          <NavLink
            to={ROUTER_PATHS.MEMO.LIST}
            className={({ isActive }) =>
              `rounded px-3 py-2 transition ${
                isActive ? 'bg-brand-3 text-white' : 'text-brand-3 hover:bg-brand-0'
              }`
            }
          >
            메모
          </NavLink>

          <NavLink
            to={ROUTER_PATHS.LOGIN}
            className={({ isActive }) =>
              `rounded px-3 py-2 transition ${
                isActive ? 'bg-brand-3 text-white' : 'text-brand-3 hover:bg-brand-0'
              }`
            }
          >
            로그인
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

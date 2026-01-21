import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* 로고 */}
        <Link to="/" className="text-lg font-bold text-slate-900">
          Welcome to React
        </Link>

        {/* 메뉴 */}
        <nav className="flex items-center gap-2 text-sm">
          <NavLink
            to="/memo/list"
            className={({ isActive }) =>
              `rounded px-3 py-2 transition ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            메모
          </NavLink>

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `rounded px-3 py-2 transition ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
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

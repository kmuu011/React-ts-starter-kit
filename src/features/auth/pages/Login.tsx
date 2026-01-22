import { Link } from 'react-router-dom'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const { id, setId, password, setPassword, handleSubmit, isLoading } = useLogin()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">로그인</h1>
          <p className="text-sm text-neutral-600">계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="id" className="mb-2 block text-sm font-medium text-neutral-700">
              아이디
            </label>
            <input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              className="w-full rounded-base border border-neutral-300 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3/20"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-neutral-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-base border border-neutral-300 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3/20"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-brand-3 focus:ring-brand-3"
              />
              <span className="ml-2 text-sm text-neutral-600">로그인 상태 유지</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-brand-3 hover:text-brand-4 hover:underline"
            >
              비밀번호 찾기
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              계정이 없으신가요?{' '}
            <Link
              to={ROUTER_PATHS.SIGNUP}
              className="font-medium text-brand-3 hover:text-brand-4 hover:underline"
            >
              회원가입
            </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

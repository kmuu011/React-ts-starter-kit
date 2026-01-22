import { Link } from 'react-router-dom'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'
import { useSignup } from '../hooks/useSignup'

export default function SignupPage() {
  const {
    id,
    setId,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    isIdDuplicate,
    isCheckingId,
    handleSubmit,
    isLoading,
  } = useSignup()

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">회원가입</h1>
          <p className="text-sm text-neutral-600">새 계정을 만드세요</p>
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
              className={`w-full rounded-base border px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 ${
                isIdDuplicate === true
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : isIdDuplicate === false
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                  : 'border-neutral-300 focus:border-brand-3 focus:ring-brand-3/20'
              }`}
              placeholder="아이디를 입력하세요"
            />
            {id && (
              <div className="mt-1 text-sm">
                {isCheckingId && (
                  <span className="text-neutral-500">중복 확인 중...</span>
                )}
                {!isCheckingId && isIdDuplicate === true && (
                  <span className="text-red-500">이미 사용 중인 아이디입니다.</span>
                )}
                {!isCheckingId && isIdDuplicate === false && (
                  <span className="text-green-500">사용 가능한 아이디입니다.</span>
                )}
              </div>
            )}
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

          <div>
            <label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium text-neutral-700">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full rounded-base border border-neutral-300 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-3 focus:outline-none focus:ring-2 focus:ring-brand-3/20"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to={ROUTER_PATHS.LOGIN}
                className="font-medium text-brand-3 hover:text-brand-4 hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

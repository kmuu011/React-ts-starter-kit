import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { signupApi, checkIdDuplicateApi } from '../api/signup.api'
import { useToastStore } from '@/shared/store/toastStore'

export default function SignupPage() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isIdDuplicate, setIsIdDuplicate] = useState<boolean | null>(null)
  const [isCheckingId, setIsCheckingId] = useState(false)
  const debounceTimerRef = useRef<number | null>(null)

  const signupMutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (response) => {
      const status = response?.status;
      
      if (status && status >= 200 && status < 300) {
        useToastStore.getState().showToast('회원가입이 완료되었습니다.', 'success');
        navigate('/login');
      }
    },
  })

  // ID 중복 체크 debounce 로직
  useEffect(() => {
    // 이전 타이머가 있으면 제거
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // ID가 비어있으면 초기화
    if (!id.trim()) {
      setIsIdDuplicate(null)
      setIsCheckingId(false)
      return
    }

    // 1초 후 API 호출
    setIsCheckingId(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await checkIdDuplicateApi(id)
        if (response?.data) {
          setIsIdDuplicate(response.data.isDuplicated)
        }
      } catch (error) {
        // 에러 발생 시 중복 체크 결과를 null로 유지
        setIsIdDuplicate(null)
      } finally {
        setIsCheckingId(false)
      }
    }, 800)

    // cleanup 함수
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== passwordConfirm) {
      useToastStore.getState().showToast('비밀번호가 일치하지 않습니다.', 'warning');
      return
    }
    
    signupMutation.mutate({ id, password })
  }

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
            disabled={signupMutation.isPending}
            className="btn btn-primary"
          >
            {signupMutation.isPending ? '가입 중...' : '회원가입'}
          </button>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
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

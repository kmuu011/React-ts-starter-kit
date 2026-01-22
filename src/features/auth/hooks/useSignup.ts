import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { signupApi, checkIdDuplicateApi } from '../api/signup.api'
import { useToastStore } from '@/shared/store/toastStore'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'

export const useSignup = () => {
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
      const status = response?.status

      if (status && status >= 200 && status < 300) {
        useToastStore.getState().showToast('회원가입이 완료되었습니다.', 'success')
        navigate(ROUTER_PATHS.LOGIN)
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
      useToastStore.getState().showToast('비밀번호가 일치하지 않습니다.', 'warning')
      return
    }

    signupMutation.mutate({ id, password })
  }

  return {
    id,
    setId,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    isIdDuplicate,
    isCheckingId,
    handleSubmit,
    isLoading: signupMutation.isPending,
  }
}

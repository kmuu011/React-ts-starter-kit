import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { loginApi } from '../api/login.api'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'
import { httpStatus } from '@/app/consts/httpStatus'

export const useLogin = () => {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [keepLogin, setKeepLogin] = useState(false)

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response?.status === httpStatus.OK) {
        navigate(ROUTER_PATHS.MEMO.LIST)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ id, password, keepLogin })
  }

  return {
    id,
    setId,
    password,
    setPassword,
    keepLogin,
    setKeepLogin,
    handleSubmit,
    isLoading: loginMutation.isPending,
  }
}

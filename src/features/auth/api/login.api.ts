import { callApi } from '@/api/client/axios'

type LoginRequest = {
  id: string
  password: string
}

type LoginResponse = {
  success: boolean
  message?: string
}

export const loginApi = async ({ id, password }: LoginRequest) => {
  return callApi<LoginResponse>({
    method: 'post',
    url: 'member/login',
    data: { id, password },
    showToast: true,
  })
}

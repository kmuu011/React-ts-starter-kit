import { callApi } from '@/api/client/axios'

type LoginRequest = {
  id: string
  password: string
  keepLogin: boolean
}

type LoginResponse = {
  success: boolean
  message?: string
}

export const loginApi = async ({ id, password, keepLogin }: LoginRequest) => {
  return callApi<LoginResponse>({
    method: 'post',
    url: 'member/login',
    data: { id, password, keepLogin },
    showToast: true,
  })
}


import { callApi } from '@/shared/api/client/axios'
import type { LoginRequest, LoginResponse } from '../types'

export const loginApi = async ({ id, password, keepLogin }: LoginRequest) => {
  return callApi<LoginResponse>({
    method: 'post',
    url: 'member/login',
    data: { id, password, keepLogin },
    showToast: true,
  })
}

import { callApi } from '@/api/client/axios'

type SignupRequest = {
  id: string
  password: string
}

type SignupResponse = {
  success: boolean
  message?: string
}

type DuplicateCheckResponse = {
  isDuplicated: boolean
}

export const signupApi = async ({ id, password }: SignupRequest) => {
  return callApi<SignupResponse>({
    method: 'post',
    url: 'member/signup',
    data: { id, password },
    showToast: true,
  })
}

export const checkIdDuplicateApi = async (id: string) => {
  return callApi<DuplicateCheckResponse>({
    method: 'get',
    url: 'member/duplicateCheck',
    data: { key: 'id', value: id },
    disableSpinner: true,
    showToast: false,
  })
}

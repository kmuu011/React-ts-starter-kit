import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError, type Method, type AxiosProgressEvent } from 'axios'
import { apiUrl } from '@/app/config/env'
import { httpStatus } from '@/app/consts/httpStatus'
import { getTimezoneOffset } from '@/shared/utils/dateUtils'
import { useLoadingStore } from '@/shared/store/loadingStore'
import { SESSION_KEY, NEW_SESSION_KEY } from '@/app/consts/sessionKeys'

interface CallApiOptions {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  url: string
  data?: Record<string, unknown> | FormData
  headers?: Record<string, string>
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  disableSpinner?: boolean
  isFileDownload?: boolean
  ignoreResponseError?: boolean
}

interface ApiConfig extends AxiosRequestConfig {
  url: string
  method: Method
  withCredentials: boolean
}

export const callApi = async <T = unknown>(options: CallApiOptions): Promise<AxiosResponse<T> | undefined> => {
  const { startLoading, endLoading } = useLoadingStore.getState()

  if (!options.disableSpinner) startLoading()

  const config: ApiConfig = {
    method: options.method,
    url: `${apiUrl}/api/${options.url}`,
    headers: {},
    withCredentials: true,
  }

  if (options.isFileDownload) config.responseType = 'blob'
  if (options.onDownloadProgress) config.onDownloadProgress = options.onDownloadProgress
  if (options.onUploadProgress) config.onUploadProgress = options.onUploadProgress

  // GET은 params, 나머지는 data
  if (options.method === 'get' && options.data && !(options.data instanceof FormData)) {
    config.params = options.data
  } else {
    config.data = options.data
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null
  if (token === '') {
    localStorage.removeItem(SESSION_KEY)
    window.location.href = '/login'
    return undefined
  }

  config.headers = {
    ...(config.headers as Record<string, string>),
    [SESSION_KEY]: token ?? '',
    ...(options.headers ?? {}),
    'timezone-offset': getTimezoneOffset(),
  }

  try {
    const result = await axios<T>(config)

    const newTokenCode = result.headers[NEW_SESSION_KEY] as string | undefined
    const isAdmin = parseInt(String(result.headers['is-admin'] ?? '0'), 10)

    if (typeof window !== 'undefined' && newTokenCode) {
      localStorage.setItem(NEW_SESSION_KEY, newTokenCode)
    }

    if (typeof window !== 'undefined') {
      if (isAdmin) sessionStorage.setItem('is-admin', String(isAdmin))
      else sessionStorage.removeItem('is-admin')
    }

    return result
  } catch (e) {
    const error = e as AxiosError<{ error?: string; message?: string }>

    if (options.ignoreResponseError) return error.response as AxiosResponse<T> | undefined

    if (error.message === 'Network Error') {
      alert('서버와 연결이 올바르지 않습니다.\n잠시후 다시 시도해주세요.')
      return undefined
    }

    const status = error.response?.status
    const errorMsg = error.response?.data?.error

    switch (status) {
      case httpStatus.UNAUTHORIZED:
        localStorage.removeItem(SESSION_KEY)
        window.location.href = '/login'
        return error.response as AxiosResponse<T> | undefined
      case httpStatus.FORBIDDEN:
        if (errorMsg === 'admin_forbidden') window.location.href = '/'
        return error.response as AxiosResponse<T> | undefined
      case undefined:
        alert('알 수 없는 오류가 발생했습니다.\n잠시후 다시 시도해주세요.\n오류가 반복될 경우 다시 로그인해 주세요.')
        localStorage.removeItem(SESSION_KEY)
        window.location.href = '/login'
        return undefined
      default:
        return error.response as AxiosResponse<T> | undefined
    }
  } finally {
    if (!options.disableSpinner) endLoading()
  }
}

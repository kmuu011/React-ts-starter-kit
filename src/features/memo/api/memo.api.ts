import { callApi } from '@/shared/api/client/axios'
import { apiUrl } from '@/app/config/env'
import type { Memo, MemoListResponse, MemoListParams, SaveMemoDto, FileInfo } from '../types'

export const getMemoListApi = async (params: MemoListParams = {}) => {
  return callApi<MemoListResponse>({
    method: 'get',
    url: 'memo',
    data: {
      page: params.page ?? 1,
      count: params.count ?? 10,
      ...(params.search && { search: params.search }),
      ...(params.archived && { archived: params.archived }),
    },
    showToast: true,
  })
}

export const getMemoDetailApi = async (memoIdx: number) => {
  return callApi<Memo>({
    method: 'get',
    url: `memo/${memoIdx}`,
    showToast: true,
  })
}

export const createMemoApi = async (data: SaveMemoDto) => {
  return callApi<Memo>({
    method: 'post',
    url: 'memo',
    data,
    showToast: true,
  })
}

export const updateMemoApi = async (memoIdx: number, data: SaveMemoDto) => {
  return callApi<{ result: boolean }>({
    method: 'patch',
    url: `memo/${memoIdx}`,
    data,
    showToast: true,
  })
}


// 파일 업로드
export const uploadFilesApi = async (
  files: File[],
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return callApi<FileInfo[]>({
    method: 'post',
    url: 'file/upload',
    data: formData,
    onUploadProgress,
    showToast: true,
  })
}

// 파일 다운로드 URL 생성 (하위 호환용)
export const getFileDownloadUrl = (fileIdx: number) => {
  return `${import.meta.env.VITE_API_URL}/api/file/${fileIdx}/download`
}

// 파일 다운로드 API 호출
export const downloadFileApi = async (fileIdx: number, fileName?: string) => {
  const response = await callApi<Blob>({
    method: 'get',
    url: `file/${fileIdx}/download`,
    isFileDownload: true,
    showToast: true,
  })

  if (response?.data) {
    // Blob을 다운로드 링크로 변환
    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Content-Disposition 헤더에서 파일명 추출 시도
    const contentDisposition = response.headers['content-disposition']
    let downloadFileName = fileName
    if (!downloadFileName && contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        downloadFileName = fileNameMatch[1].replace(/['"]/g, '')
      }
    }
    
    link.download = downloadFileName || `file-${fileIdx}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

// 정적 파일 URL 생성 (apiUrl + /static + fileKey)
export const getStaticFileUrl = (fileKey: string) => {
  return `${apiUrl}/static${fileKey}`
}

// 파일 삭제
export const deleteFileApi = async (fileIdx: number) => {
  return callApi<{ result: boolean }>({
    method: 'delete',
    url: `file/${fileIdx}`,
    showToast: true,
  })
}

// 메모
export type Memo = {
  idx: number
  title?: string | null
  pinned: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
  content?: string | null // Lexical JSON
}

export type MemoListResponse = {
  itemList: Memo[]
  page: number
  count: number
  totalCount: number
}

export type MemoListParams = {
  page?: number
  count?: number
  search?: string
  archived?: '0' | '1'
}

// 메모 생성/수정 DTO
export type SaveMemoDto = {
  title?: string | null
  pinned?: boolean
  archived?: boolean
  content?: any // Lexical JSON 객체
}

// 파일 정보
export type FileInfo = {
  idx: number
  fileKey: string
  fileName: string
  fileType: string
  fileMimeType: string
  fileSize: string
  createdAt: string
}

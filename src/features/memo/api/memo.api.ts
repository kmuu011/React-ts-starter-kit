import { callApi } from '@/api/client/axios'

// 블록 타입
export type BlockType = 'TEXT' | 'CHECKLIST' | 'IMAGE' | 'VIDEO'

// 메모 블록
export type MemoBlock = {
  idx?: number
  orderIndex: number
  type: BlockType
  content?: string | null
  checked?: boolean | null
  fileIdx?: number | null
  displayWidth?: number | null
  displayHeight?: number | null
  videoDurationMs?: number | null
}

// 메모
export type Memo = {
  idx: number
  title?: string | null
  pinned: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
  blocks: MemoBlock[]
}

export type MemoListResponse = {
  itemList: Memo[]
  page: number
  count: number
  totalCount: number
}

type MemoListParams = {
  page?: number
  count?: number
  search?: string
  archived?: '0' | '1'
}

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

// 메모 생성/수정 DTO
export type SaveMemoDto = {
  title?: string | null
  pinned?: boolean
  archived?: boolean
  blocks: Omit<MemoBlock, 'idx'>[]
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

export const toggleBlockCheckedApi = async (memoIdx: number, blockIdx: number) => {
  return callApi<{ result: boolean }>({
    method: 'patch',
    url: `memo/${memoIdx}/block/${blockIdx}/toggle`,
    showToast: false,
  })
}

import { callApi } from '@/api/client/axios'

export type MemoItem = {
  idx: number
  memo: string
  memberIdx: number
  createdAt: string
  updatedAt: string
}

export type MemoListResponse = {
  itemList: MemoItem[]
  page: number
  count: number
  totalCount: number
  last: number
}

type MemoListParams = {
  page?: number
  count?: number
}

export const getMemoListApi = async (params: MemoListParams = {}) => {
  return callApi<MemoListResponse>({
    method: 'get',
    url: 'memo',
    data: {
      page: params.page ?? 1,
      count: params.count ?? 10,
    },
    showToast: true,
  })
}

import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMemoDetailApi, updateMemoApi, type MemoBlock } from '../api/memo.api'
import { getMemoDetailPath, ROUTER_PATHS } from '@/app/consts/routerPaths'

export const useMemoEdit = () => {
  const { memoIdx } = useParams<{ memoIdx: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['memoDetail', memoIdx],
    queryFn: () => getMemoDetailApi(Number(memoIdx)),
    enabled: !!memoIdx,
  })

  const memo = data?.data

  const updateMutation = useMutation({
    mutationFn: (params: { title: string | null; blocks: Omit<MemoBlock, 'idx'>[] }) =>
      updateMemoApi(Number(memoIdx), {
        title: params.title,
        pinned: memo?.pinned,
        archived: memo?.archived,
        blocks: params.blocks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
      queryClient.invalidateQueries({ queryKey: ['memoDetail', memoIdx] })
      navigate(getMemoDetailPath(memoIdx!))
    },
  })

  const handleSave = (title: string | null, blocks: Omit<MemoBlock, 'idx'>[]) => {
    updateMutation.mutate({ title, blocks })
  }

  const handleCancel = () => {
    navigate(getMemoDetailPath(memoIdx!))
  }

  const handleGoToList = () => {
    navigate(ROUTER_PATHS.MEMO.LIST)
  }

  const handleGoBack = () => {
    navigate(getMemoDetailPath(memoIdx!))
  }

  return {
    memo,
    isLoading,
    isError,
    memoIdx,
    handleSave,
    handleCancel,
    handleGoToList,
    handleGoBack,
  }
}

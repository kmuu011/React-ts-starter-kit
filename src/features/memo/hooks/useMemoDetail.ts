import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMemoDetailApi, toggleBlockCheckedApi, type MemoBlock } from '../api/memo.api'
import { ROUTER_PATHS, getMemoEditPath } from '@/app/consts/routerPaths'
import { formatDate } from '@/shared/utils/dateUtils'

export const useMemoDetail = () => {
  const { memoIdx } = useParams<{ memoIdx: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['memoDetail', memoIdx],
    queryFn: () => getMemoDetailApi(Number(memoIdx)),
    enabled: !!memoIdx,
  })

  const memo = data?.data

  const toggleBlockMutation = useMutation({
    mutationFn: (blockIdx: number) => toggleBlockCheckedApi(Number(memoIdx), blockIdx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoDetail', memoIdx] })
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
    },
  })

  const handleToggleCheck = (block: MemoBlock) => {
    if (block.type === 'CHECKLIST' && block.idx) {
      toggleBlockMutation.mutate(block.idx)
    }
  }

  const handleGoToList = () => {
    navigate(ROUTER_PATHS.MEMO.LIST)
  }

  const handleGoToEdit = () => {
    navigate(getMemoEditPath(memoIdx!))
  }

  return {
    memo,
    isLoading,
    isError,
    memoIdx,
    handleToggleCheck,
    handleGoToList,
    handleGoToEdit,
    formatDate,
    isToggling: toggleBlockMutation.isPending,
  }
}

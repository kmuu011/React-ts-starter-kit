import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { EditorState } from 'lexical'
import { getMemoDetailApi, updateMemoApi } from '../api/memo.api'
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

  const updateMutation = useMutation({
    mutationFn: (content: any) =>
      updateMemoApi(Number(memoIdx), {
        title: memo?.title,
        pinned: memo?.pinned,
        archived: memo?.archived,
        content,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
      // 상세 쿼리를 다시 가져와서 최신 데이터로 업데이트
      await queryClient.refetchQueries({ queryKey: ['memoDetail', memoIdx] })
    },
  })

  const handleGoToList = () => {
    navigate(ROUTER_PATHS.MEMO.LIST)
  }

  const handleGoToEdit = () => {
    navigate(getMemoEditPath(memoIdx!))
  }

  const handleCheckboxToggle = (editorState: EditorState) => {
    const content = editorState.toJSON()
    updateMutation.mutate(content)
  }

  return {
    memo,
    isLoading,
    isError,
    memoIdx,
    handleGoToList,
    handleGoToEdit,
    handleCheckboxToggle,
    formatDate,
  }
}

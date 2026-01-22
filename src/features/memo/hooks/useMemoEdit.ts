import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { EditorState } from 'lexical'
import { getMemoDetailApi, updateMemoApi } from '../api/memo.api'
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
    mutationFn: (params: { title: string | null; content: any }) =>
      updateMemoApi(Number(memoIdx), {
        title: params.title,
        pinned: memo?.pinned,
        archived: memo?.archived,
        content: params.content,
      }),
    onSuccess: async () => {
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
      // 상세 쿼리를 다시 가져와서 최신 데이터로 업데이트
      await queryClient.refetchQueries({ queryKey: ['memoDetail', memoIdx] })
      // 쿼리가 완료된 후 페이지 이동
      navigate(getMemoDetailPath(memoIdx!))
    },
  })

  const handleSave = (title: string | null, editorState: EditorState) => {
    const content = editorState.toJSON()
    updateMutation.mutate({ title, content })
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

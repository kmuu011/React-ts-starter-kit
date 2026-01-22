import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMemoApi, type MemoBlock } from '../api/memo.api'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'

export const useMemoCreate = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createMemoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
      navigate(ROUTER_PATHS.MEMO.LIST)
    },
  })

  const handleSave = (title: string | null, blocks: Omit<MemoBlock, 'idx'>[]) => {
    createMutation.mutate({
      title,
      pinned: false,
      archived: false,
      blocks,
    })
  }

  const handleCancel = () => {
    navigate(ROUTER_PATHS.MEMO.LIST)
  }

  const handleGoToList = () => {
    navigate(ROUTER_PATHS.MEMO.LIST)
  }

  return {
    handleSave,
    handleCancel,
    handleGoToList,
  }
}

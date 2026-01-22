import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EditorState } from 'lexical'
import { createMemoApi } from '../api/memo.api'
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

  const handleSave = (title: string | null, editorState: EditorState) => {
    const content = editorState.toJSON()
    createMutation.mutate({
      title,
      pinned: false,
      archived: false,
      content: content as any,
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

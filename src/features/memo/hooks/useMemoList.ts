import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMemoListApi } from '../api/memo.api'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'

export const useMemoList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const count = 10

  const { data, isLoading, isError } = useQuery({
    queryKey: ['memoList', page, count],
    queryFn: () => getMemoListApi({ page, count }),
  })

  const memoList = data?.data?.itemList ?? []
  const totalCount = data?.data?.totalCount ?? 0
  const lastPage = Math.ceil(totalCount / count) || 1

  const handleCreateMemo = () => {
    navigate(ROUTER_PATHS.MEMO.CREATE)
  }

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setPage((prev) => Math.min(lastPage, prev + 1))
  }

  return {
    memoList,
    totalCount,
    isLoading,
    isError,
    page,
    lastPage,
    handleCreateMemo,
    handlePrevPage,
    handleNextPage,
  }
}

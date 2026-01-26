import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMemoListApi } from '../api/memo.api'
import { ROUTER_PATHS } from '@/app/consts/routerPaths'

export const useMemoList = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageSize = 10

  // 쿼리 파라미터에서 page를 가져오기 (기본값: 1)
  const page = useMemo(() => {
    const pageParam = searchParams.get('page')
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1
    return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
  }, [searchParams])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['memoList', page, pageSize],
    queryFn: () => getMemoListApi({ page, count: pageSize }),
  })

  const memoList = data?.data?.itemList ?? []
  const totalCount = data?.data?.totalCount ?? 0
  const lastPage = Math.ceil(totalCount / pageSize) || 1

  const handleCreateMemo = () => {
    navigate(ROUTER_PATHS.MEMO.CREATE)
  }

  // 페이지 변경 시 쿼리 파라미터 업데이트
  const updatePage = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, lastPage))
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (validPage === 1) {
        newParams.delete('page')
      } else {
        newParams.set('page', validPage.toString())
      }
      return newParams
    })
  }

  const handlePrevPage = () => {
    updatePage(page - 1)
  }

  const handleNextPage = () => {
    updatePage(page + 1)
  }

  const handlePageChange = (page: number | { page: number }) => {
    if (typeof page === 'number') {
      updatePage(page)
    } else {
      updatePage(page.page)
    }
  }

  // setPage는 호환성을 위해 유지 (내부적으로 updatePage 호출)
  const setPage = (newPage: number | ((prev: number) => number)) => {
    if (typeof newPage === 'function') {
      updatePage(newPage(page))
    } else {
      updatePage(newPage)
    }
  }

  return {
    memoList,
    totalCount,
    isLoading,
    isError,
    page,
    pageSize,
    setPage,
    lastPage,
    handleCreateMemo,
    handlePrevPage,
    handleNextPage,
    handlePageChange,
  }
}

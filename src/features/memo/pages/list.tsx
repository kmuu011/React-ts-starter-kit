import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMemoListApi } from '../api/memo.api'
import MemoItem from '../components/MemoItem'

export default function MemoListPage() {
  const [page, setPage] = useState(1)
  const count = 10

  const { data, isLoading, isError } = useQuery({
    queryKey: ['memoList', page, count],
    queryFn: () => getMemoListApi({ page, count }),
  })

  const memoList = data?.data?.itemList ?? []
  const totalCount = data?.data?.totalCount ?? 0
  const lastPage = data?.data?.last ?? 1

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">메모 목록</h1>
        <p className="mt-2 text-sm text-neutral-600">
          저장된 메모를 확인하고 관리하세요 ({totalCount}개)
        </p>
      </div>

      {isLoading && (
        <div className="rounded-base border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-base border border-red-200 bg-red-50 p-12 text-center">
          <p className="text-red-600">메모 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {memoList.length === 0 ? (
            <div className="rounded-base border border-neutral-200 bg-white p-12 text-center">
              <p className="text-neutral-500">등록된 메모가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {memoList.map((memo) => (
                <MemoItem key={memo.idx} memo={memo} />
              ))}
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                이전
              </button>
              <span className="text-sm text-neutral-600">
                {page} / {lastPage}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
                disabled={page === lastPage}
                className="rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

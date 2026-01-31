import MemoItem from '../components/MemoItem/MemoItem'
import { useMemoList } from '../hooks/useMemoList'
import Pagination from '@/shared/components/ui/Pagination'
import { Button } from '@/shared/components/ui/Button'

export default function MemoListPage() {
  const {
    memoList,
    totalCount,
    isLoading,
    isError,
    page,
    pageSize,
    handleCreateMemo,
    handlePageChange,
  } = useMemoList()

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">메모 목록</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:mt-2">
            저장된 메모를 확인하고 관리하세요 ({totalCount}개)
          </p>
        </div>
        <Button onClick={handleCreateMemo} variant="brand" className="flex w-full items-center justify-center gap-2 sm:w-auto">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 메모
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-base border border-neutral-200 bg-white p-8 text-center sm:p-12">
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-base border border-red-200 bg-red-50 p-8 text-center sm:p-12">
          <p className="text-red-600">메모 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {memoList.length === 0 ? (
            <div className="rounded-base border border-neutral-200 bg-white p-8 text-center sm:p-12">
              <p className="text-neutral-500">등록된 메모가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {memoList.map((memo) => (
                <MemoItem key={memo.idx} memo={memo} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            setCurrentPage={handlePageChange}
            totalCount={totalCount}
            pageSize={pageSize}
            pageGroupSize={10}
            includeEndButton={true}
          />
        </>
      )}
    </div>
  )
}

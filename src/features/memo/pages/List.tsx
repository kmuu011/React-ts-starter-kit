import MemoItem from '../components/MemoItem/MemoItem'
import { useMemoList } from '../hooks/useMemoList'

export default function MemoListPage() {
  const {
    memoList,
    totalCount,
    isLoading,
    isError,
    page,
    lastPage,
    handleCreateMemo,
    handlePrevPage,
    handleNextPage,
  } = useMemoList()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">메모 목록</h1>
          <p className="mt-2 text-sm text-neutral-600">
            저장된 메모를 확인하고 관리하세요 ({totalCount}개)
          </p>
        </div>
        <button
          onClick={handleCreateMemo}
          className="flex items-center gap-2 rounded-base bg-brand-3 px-4 py-2 text-sm text-white hover:bg-brand-4"
        >
          <svg className="h-4 w-4" fill="none" stroke="#fff" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="#fff" d="M12 4v16m8-8H4" />
          </svg>
          새 메모
        </button>
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
                onClick={handlePrevPage}
                disabled={page === 1}
                className="rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
              >
                이전
              </button>
              <span className="text-sm text-neutral-600">
                {page} / {lastPage}
              </span>
              <button
                onClick={handleNextPage}
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

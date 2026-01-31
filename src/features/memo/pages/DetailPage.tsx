import { useMemoDetail } from '../hooks/useMemoDetail'
import LexicalEditor from '../components/LexicalEditor/LexicalEditor'
import { Button } from '@/shared/components/ui/Button'

export default function MemoDetailPage() {
  const {
    memo,
    isLoading,
    isError,
    handleGoToList,
    handleGoToEdit,
    handleCheckboxToggle,
    formatDate,
  } = useMemoDetail()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-8">
        <div className="rounded-base border border-neutral-200 bg-white p-8 sm:p-12 text-center">
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (isError || !memo) {
    return (
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-8">
        <div className="rounded-base border border-red-200 bg-red-50 p-8 sm:p-12 text-center">
          <p className="text-red-600">메모를 불러오는 중 오류가 발생했습니다.</p>
          <Button
            onClick={handleGoToList}
            variant="ghost"
            size="sm"
            className="mt-4 underline"
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <Button
          onClick={handleGoToList}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-xs sm:text-sm"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Button>
        <Button
          onClick={handleGoToEdit}
          variant="primary"
          size="sm"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          수정
        </Button>
      </div>

      <div className="rounded-base border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="mb-3 sm:mb-4 flex items-center gap-2">
          {memo.pinned && (
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4l1.5 1.5-1.5 1.5h3v2h-3l1.5 1.5-1.5 1.5-5-5 5-5zm-6 8l-6 6v2h2l6-6-2-2z" />
            </svg>
          )}
          {memo.archived && (
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
              보관됨
            </span>
          )}
        </div>

        <h1 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-neutral-900">
          {memo.title || '제목 없음'}
        </h1>

        <div className="mb-4 sm:mb-6">
          {memo.content ? (
            <LexicalEditor
              initialEditorState={memo.content}
              editable={false}
              onCheckboxToggle={handleCheckboxToggle}
            />
          ) : (
            <div className="text-neutral-400">
              내용이 없습니다.
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-0 text-[10px] sm:text-xs text-neutral-500">
            <span>작성일: {formatDate(memo.createdAt)}</span>
            {memo.updatedAt !== memo.createdAt && (
              <span>수정일: {formatDate(memo.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

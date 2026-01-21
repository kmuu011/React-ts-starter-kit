import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMemoDetailApi, toggleBlockCheckedApi, type MemoBlock } from '../api/memo.api'

export default function MemoDetailPage() {
  const { memoIdx } = useParams<{ memoIdx: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['memoDetail', memoIdx],
    queryFn: () => getMemoDetailApi(Number(memoIdx)),
    enabled: !!memoIdx,
  })

  const memo = data?.data

  const toggleBlockMutation = useMutation({
    mutationFn: (blockIdx: number) => toggleBlockCheckedApi(Number(memoIdx), blockIdx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoDetail', memoIdx] })
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
    },
  })

  const handleToggleCheck = (block: MemoBlock) => {
    if (block.type === 'CHECKLIST' && block.idx) {
      toggleBlockMutation.mutate(block.idx)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderBlock = (block: MemoBlock) => {
    switch (block.type) {
      case 'TEXT':
        return (
          <p className="whitespace-pre-wrap text-neutral-700">{block.content}</p>
        )
      case 'CHECKLIST':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={block.checked ?? false}
              onChange={() => handleToggleCheck(block)}
              disabled={toggleBlockMutation.isPending}
              className="h-5 w-5 rounded border-neutral-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className={`${block.checked ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
              {block.content}
            </p>
          </div>
        )
      case 'IMAGE':
        return (
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-4 text-neutral-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>이미지 (fileIdx: {block.fileIdx})</span>
          </div>
        )
      case 'VIDEO':
        return (
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-4 text-neutral-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>비디오 (fileIdx: {block.fileIdx})</span>
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-base border border-neutral-200 bg-white p-12 text-center">
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (isError || !memo) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-base border border-red-200 bg-red-50 p-12 text-center">
          <p className="text-red-600">메모를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => navigate('/memo/list')}
            className="mt-4 text-sm text-neutral-600 underline hover:text-neutral-800"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const sortedBlocks = [...memo.blocks].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/memo/list')}
          className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
        <button
          onClick={() => navigate(`/memo/${memoIdx}/edit`)}
          className="flex items-center gap-2 rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          수정
        </button>
      </div>

      <div className="rounded-base border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          {memo.pinned && (
            <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4l1.5 1.5-1.5 1.5h3v2h-3l1.5 1.5-1.5 1.5-5-5 5-5zm-6 8l-6 6v2h2l6-6-2-2z" />
            </svg>
          )}
          {memo.archived && (
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
              보관됨
            </span>
          )}
        </div>

        <h1 className="mb-6 text-2xl font-bold text-neutral-900">
          {memo.title || '제목 없음'}
        </h1>

        {sortedBlocks.length > 0 ? (
          <div className="mb-6 space-y-3">
            {sortedBlocks.map((block) => (
              <div key={block.idx ?? block.orderIndex}>
                {renderBlock(block)}
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 text-neutral-400">
            내용이 없습니다.
          </div>
        )}

        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
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

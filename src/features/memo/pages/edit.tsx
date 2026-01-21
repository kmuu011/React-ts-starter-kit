import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMemoDetailApi, updateMemoApi, type MemoBlock } from '../api/memo.api'
import MemoEditor from '../components/MemoEditor'

export default function MemoEditPage() {
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
    mutationFn: (params: { title: string | null; blocks: Omit<MemoBlock, 'idx'>[] }) =>
      updateMemoApi(Number(memoIdx), {
        title: params.title,
        pinned: memo?.pinned,
        archived: memo?.archived,
        blocks: params.blocks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoList'] })
      queryClient.invalidateQueries({ queryKey: ['memoDetail', memoIdx] })
      navigate(`/memo/${memoIdx}`)
    },
  })

  const handleSave = (title: string | null, blocks: Omit<MemoBlock, 'idx'>[]) => {
    updateMutation.mutate({ title, blocks })
  }

  const handleCancel = () => {
    navigate(`/memo/${memoIdx}`)
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/memo/${memoIdx}`)}
          className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </button>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-neutral-900">메모 수정</h1>

      <MemoEditor
        initialTitle={memo.title}
        initialBlocks={memo.blocks}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}

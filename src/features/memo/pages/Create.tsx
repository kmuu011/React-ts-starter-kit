import MemoEditor from '../components/MemoEditor/MemoEditor'
import { useMemoCreate } from '../hooks/useMemoCreate'

export default function MemoCreatePage() {
  const { handleSave, handleCancel, handleGoToList } = useMemoCreate()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <button
          onClick={handleGoToList}
          className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-neutral-900">새 메모 작성</h1>

      <MemoEditor
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}

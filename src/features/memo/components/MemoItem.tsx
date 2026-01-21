import type { MemoItem as MemoItemType } from '../api/memo.api'

type MemoItemProps = {
  memo: MemoItemType
}

export default function MemoItem({ memo }: MemoItemProps) {
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

  return (
    <div className="rounded-base border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm">
      <div className="mb-2">
        <p className="text-neutral-900">{memo.memo}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>작성일: {formatDate(memo.createdAt)}</span>
        {memo.updatedAt !== memo.createdAt && (
          <span>수정일: {formatDate(memo.updatedAt)}</span>
        )}
      </div>
    </div>
  )
}

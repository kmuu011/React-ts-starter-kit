import type { Memo, MemoBlock } from '../../api/memo.api'
import { formatDate } from '@/shared/utils/dateUtils'
import { useMemoItem } from './useMemoItem'

type MemoItemProps = {
  memo: Memo
  maxPreviewLines?: number
}

export default function MemoItem({ memo, maxPreviewLines = 5 }: MemoItemProps) {
  const { previewBlocks, hasMoreBlocks, handleClick, getFileTypeInfo } = useMemoItem({
    memo,
    maxPreviewLines,
  })

  const renderBlockPreview = (block: MemoBlock) => {
    switch (block.type) {
      case 'TEXT':
        return (
          <p className="truncate text-neutral-700">{block.content}</p>
        )
      case 'CHECKLIST':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.checked ?? false}
              readOnly
              className="h-4 w-4 rounded border-neutral-300"
            />
            <p className={`truncate ${block.checked ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
              {block.content}
            </p>
          </div>
        )
      case 'FILE': {
        const { isImage, isVideo } = getFileTypeInfo(block)

        return (
          <div className="flex items-center gap-2 text-neutral-500">
            {isImage ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">이미지</span>
              </>
            ) : isVideo ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">비디오</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">파일</span>
              </>
            )}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-base border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        {memo.pinned && (
          <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 4l1.5 1.5-1.5 1.5h3v2h-3l1.5 1.5-1.5 1.5-5-5 5-5zm-6 8l-6 6v2h2l6-6-2-2z" />
          </svg>
        )}
        <h3 className="font-medium text-neutral-900">
          {memo.title || '제목 없음'}
        </h3>
      </div>

      {previewBlocks.length > 0 && (
        <div className="mb-3 space-y-1">
          {previewBlocks.map((block) => (
            <div key={block.idx ?? block.orderIndex}>
              {renderBlockPreview(block)}
            </div>
          ))}
          {hasMoreBlocks && (
            <p className="text-sm text-neutral-400">...</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>작성일: {formatDate(memo.createdAt)}</span>
        {memo.updatedAt !== memo.createdAt && (
          <span>수정일: {formatDate(memo.updatedAt)}</span>
        )}
      </div>
    </div>
  )
}

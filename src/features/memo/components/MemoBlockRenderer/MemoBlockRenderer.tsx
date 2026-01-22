import type { MemoBlock } from '../../api/memo.api'
import { useMemoBlockRenderer } from './useMemoBlockRenderer'

interface MemoBlockRendererProps {
  block: MemoBlock
  onToggleCheck: (block: MemoBlock) => void
  isToggling: boolean
}

export default function MemoBlockRenderer({ block, onToggleCheck, isToggling }: MemoBlockRendererProps) {
  const {
    getFileInfo,
    handleFileDownload,
    getFileName,
    getImageStyles,
    getImageMaxHeight,
  } = useMemoBlockRenderer({ block })

  const renderBlock = () => {
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
              onChange={() => onToggleCheck(block)}
              disabled={isToggling}
              className="h-5 w-5 rounded border-neutral-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className={`${block.checked ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
              {block.content}
            </p>
          </div>
        )
      case 'FILE': {
        const { isImage, isVideo, displayUrl, downloadUrl } = getFileInfo()

        return displayUrl || downloadUrl ? (
          <>
            {isImage && displayUrl ? (
              <div
                className="inline-block"
                style={getImageStyles()}
              >
                <img
                  src={displayUrl}
                  alt={block.file?.fileName || '파일'}
                  className="w-full h-full rounded-lg object-contain"
                  style={getImageMaxHeight()}
                />
              </div>
            ) : isVideo && displayUrl ? (
              <div
                className="inline-block"
                style={getImageStyles()}
              >
                <video
                  src={displayUrl}
                  controls
                  className="w-full h-full rounded-lg"
                  style={getImageMaxHeight()}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-4 text-neutral-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {block.fileIdx && (
                  <button
                    onClick={handleFileDownload}
                    className="text-sm text-brand-3 hover:underline"
                  >
                    {getFileName()}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-4 text-neutral-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>파일을 불러올 수 없습니다</span>
          </div>
        )
      }
      default:
        return null
    }
  }

  return <>{renderBlock()}</>
}

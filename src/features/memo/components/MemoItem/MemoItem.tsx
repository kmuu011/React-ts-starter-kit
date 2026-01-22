import type { Memo } from '../../api/memo.api'
import { formatDate } from '@/shared/utils/dateUtils'
import { useMemoItem } from './useMemoItem'
import type { ReactNode } from 'react'

type MemoItemProps = {
  memo: Memo
}

export default function MemoItem({ memo }: MemoItemProps) {
  const { previewText, mediaItems, handleClick } = useMemoItem({ memo })

  // 미디어 아이콘 렌더링
  const renderMediaIcon = (type: 'image' | 'video' | 'file') => {
    const iconClass = "h-4 w-4 text-brand-3"
    
    if (type === 'image') {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
    if (type === 'video') {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
    if (type === 'file') {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
    return null
  }

  // 미디어 타입에 따른 텍스트 반환
  const getMediaText = (type: 'image' | 'video' | 'file') => {
    if (type === 'image') return '이미지'
    if (type === 'video') return '비디오'
    if (type === 'file') return '파일'
    return ''
  }

  // 미디어 마커를 아이콘으로 변환
  const renderPreview = () => {
    if (!previewText && mediaItems.length === 0) return null
    
    if (!previewText) {
      // 텍스트가 없고 미디어만 있는 경우
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {mediaItems.map((item, index) => (
            <span key={`media-${index}`} className="inline-flex items-center gap-1">
              {renderMediaIcon(item.type)}
              <span>{getMediaText(item.type)}</span>
            </span>
          ))}
        </div>
      )
    }
    
    const lines = previewText.split('\n')
    const result: ReactNode[] = []
    
    lines.forEach((line, lineIndex) => {
      if (line.trim() || line.includes('__MEDIA_')) {
        const parts = line.split(/(__MEDIA_(IMAGE|VIDEO|FILE)_\d+__)/)
        const lineElements: ReactNode[] = []
        
        parts.forEach((part, partIndex) => {
          const mediaMatch = part.match(/^__MEDIA_(IMAGE|VIDEO|FILE)_(\d+)__$/)
          if (mediaMatch) {
            const [, typeStr, indexStr] = mediaMatch
            const index = parseInt(indexStr, 10)
            const mediaItem = mediaItems[index]
            
            if (mediaItem) {
              lineElements.push(
                <span key={`media-${lineIndex}-${partIndex}`} className="inline-flex items-center gap-1 mr-1">
                  {renderMediaIcon(mediaItem.type)}
                  <span>{getMediaText(mediaItem.type)}</span>
                </span>
              )
            }
          } else if (part.trim()) {
            lineElements.push(part)
          }
        })
        
        if (lineElements.length > 0) {
          result.push(
            <div key={`line-${lineIndex}`} className="flex items-center gap-1 flex-wrap">
              {lineElements}
            </div>
          )
        }
      }
    })
    
    return result.length > 0 ? result : null
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
        <h3 className="text-lg font-bold text-neutral-900">
          {memo.title || '제목 없음'}
        </h3>
      </div>

      {(previewText || mediaItems.length > 0) && (
        <div className="mb-3 max-h-[4.5rem] overflow-hidden">
          <div className="text-sm text-neutral-600 space-y-1">
            {renderPreview()}
          </div>
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

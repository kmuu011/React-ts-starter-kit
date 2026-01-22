import type { MemoBlock } from '../../api/memo.api'
import { getFileDownloadUrl, getStaticFileUrl } from '../../api/memo.api'
import { useModalStore } from '@/shared/store/modalStore'
import MemoShortcutsGuide from '../MemoShortcutsGuide'
import { useMemoEditor, type EditorBlock } from './useMemoEditor'

type MemoEditorProps = {
  initialTitle?: string | null
  initialBlocks?: MemoBlock[]
  onSave: (title: string | null, blocks: Omit<MemoBlock, 'idx'>[]) => void
  onCancel: () => void
}

export default function MemoEditor({
  initialTitle = '',
  initialBlocks = [],
  onSave,
  onCancel,
}: MemoEditorProps) {
  const { openModal, closeModal } = useModalStore()
  const shortcutsModalId = 'memo-shortcuts'

  const {
    title,
    setTitle,
    blocks,
    focusedBlockId,
    setFocusedBlockId,
    isUploading,
    fileInputRef,
    blockRefs,
    addBlock,
    updateBlock,
    removeBlock,
    toggleChecklistType,
    handleKeyDown,
    handleSave,
    handleFileUpload,
    draggedBlockId,
    dragOverBlockId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  } = useMemoEditor({ initialTitle, initialBlocks, onSave })

  const renderBlockEditor = (block: EditorBlock, index: number) => {
    switch (block.type) {
      case 'TEXT':
        return (
          <textarea
            ref={(el) => {
              if (el) {
                blockRefs.current.set(block.tempId, el)
              } else {
                blockRefs.current.delete(block.tempId)
              }
            }}
            value={block.content || ''}
            onChange={(e) => updateBlock(block.tempId, { content: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, block, index)}
            onFocus={() => setFocusedBlockId(block.tempId)}
            placeholder=""
            className="w-full resize-none border-0 bg-transparent p-0 text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-0"
            rows={1}
            style={{ minHeight: '24px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />
        )
      case 'CHECKLIST':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.checked ?? false}
              onChange={(e) => updateBlock(block.tempId, { checked: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <input
              ref={(el) => {
                if (el) {
                  blockRefs.current.set(block.tempId, el)
                } else {
                  blockRefs.current.delete(block.tempId)
                }
              }}
              type="text"
              value={block.content || ''}
              onChange={(e) => updateBlock(block.tempId, { content: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              onFocus={() => setFocusedBlockId(block.tempId)}
              placeholder=""
              className={`flex-1 border-0 bg-transparent p-0 placeholder-neutral-400 focus:outline-none focus:ring-0 ${
                block.checked ? 'text-neutral-400 line-through' : 'text-neutral-700'
              }`}
            />
          </div>
        )
      case 'FILE': {
        // previewUrl (새로 업로드한 파일) > file.fileKey (서버에서 받은 데이터) > fileIdx (하위 호환)
        const fileUrl = block.previewUrl
          || (block.file?.fileKey ? getStaticFileUrl(block.file.fileKey) : null)
          || (block.fileIdx ? getFileDownloadUrl(block.fileIdx) : null)

        // fileCategory로 이미지/비디오 판단, 없으면 확장자로 판단
        const fileCategory = block.file?.fileCategory
        const isImage = fileCategory === 'IMAGE' || (fileUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUrl))
        const isVideo = fileCategory === 'VIDEO' || (fileUrl && /\.(mp4|webm|ogg)$/i.test(fileUrl))

        // 이미지/비디오 리사이즈 핸들러
        const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
          e.preventDefault()
          const container = (e.currentTarget as HTMLElement).parentElement as HTMLElement
          const startX = e.clientX
          const startY = e.clientY
          const startWidth = container.offsetWidth
          const startHeight = container.offsetHeight

          const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            const newWidth = Math.max(100, startWidth + deltaX)
            const newHeight = Math.max(100, startHeight + deltaY)

            container.style.width = `${newWidth}px`
            container.style.height = `${newHeight}px`
          }

          const onMouseUp = () => {
            const finalWidth = container.offsetWidth
            const finalHeight = container.offsetHeight

            // block에 displayWidth, displayHeight 저장
            updateBlock(block.tempId, {
              displayWidth: finalWidth,
              displayHeight: finalHeight
            })

            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }

        return (
          <div className="relative rounded-lg bg-neutral-100 p-2">
            {fileUrl ? (
              <>
                {isImage ? (
                  <div
                    className="relative inline-block group"
                    style={{
                      width: block.displayWidth ? `${block.displayWidth}px` : 'auto',
                      height: block.displayHeight ? `${block.displayHeight}px` : 'auto',
                      maxWidth: '100%'
                    }}
                  >
                    <img
                      src={fileUrl}
                      alt={block.file?.fileName || block.originalFileName || '파일'}
                      className="w-full h-full rounded object-contain"
                      style={{ maxHeight: block.displayHeight ? 'none' : '256px' }}
                    />
                    <div
                      onMouseDown={handleResize}
                      className="absolute bottom-0 right-0 w-4 h-4 bg-neutral-700 cursor-nwse-resize opacity-0 group-hover:opacity-70 transition-opacity"
                      style={{ borderRadius: '0 0 4px 0' }}
                    />
                  </div>
                ) : isVideo ? (
                  <div
                    className="relative inline-block group"
                    style={{
                      width: block.displayWidth ? `${block.displayWidth}px` : 'auto',
                      height: block.displayHeight ? `${block.displayHeight}px` : 'auto',
                      maxWidth: '100%'
                    }}
                  >
                    <video
                      src={fileUrl}
                      controls
                      className="w-full h-full rounded"
                      style={{ maxHeight: block.displayHeight ? 'none' : '256px' }}
                    />
                    <div
                      onMouseDown={handleResize}
                      className="absolute bottom-0 right-0 w-4 h-4 bg-neutral-700 cursor-nwse-resize opacity-0 group-hover:opacity-70 transition-opacity"
                      style={{ borderRadius: '0 0 4px 0' }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 text-neutral-500">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-3 hover:underline"
                    >
                      {block.file?.fileName && block.file?.fileType
                        ? `${block.file.fileName}.${block.file.fileType}`
                        : block.originalFileName || '파일 다운로드'}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 p-4 text-neutral-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>파일 업로드 중...</span>
              </div>
            )}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="rounded-base border border-neutral-200 bg-white">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      <div className="border-b border-neutral-100 p-4 flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요..."
          className="flex-1 border-0 bg-transparent p-0 text-lg font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-0"
        />
        <button
          onClick={() =>
            openModal(shortcutsModalId, {
              title: '단축키 안내',
              content: (
                <MemoShortcutsGuide onClose={() => closeModal(shortcutsModalId)} />
              ),
            })
          }
          className="p-1 text-neutral-400 hover:text-neutral-600 transition"
          title="단축키 안내"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div
              key={block.tempId}
              draggable
              onDragStart={(e) => handleDragStart(e, block.tempId)}
              onDragOver={(e) => handleDragOver(e, block.tempId)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, block.tempId)}
              className={`group flex items-start gap-2 rounded transition-colors ${
                draggedBlockId === block.tempId
                  ? 'opacity-50'
                  : dragOverBlockId === block.tempId
                  ? 'bg-neutral-100'
                  : ''
              }`}
            >
              <button
                className="cursor-move p-1 text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition"
                onMouseDown={(e) => e.preventDefault()}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
              <div className="flex-1">
                {renderBlockEditor(block, index)}
              </div>
              <button
                onClick={() => removeBlock(block.tempId, index)}
                className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-600 transition"
                disabled={blocks.length <= 1}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              const focusedIndex = focusedBlockId
                ? blocks.findIndex((b) => b.tempId === focusedBlockId)
                : blocks.length - 1
              const insertIndex = focusedIndex >= 0 ? focusedIndex : blocks.length - 1
              addBlock('TEXT', insertIndex)
            }}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            텍스트
          </button>
          <button
            onClick={toggleChecklistType}
            disabled={!focusedBlockId}
            className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition ${
              focusedBlockId && blocks.find((b) => b.tempId === focusedBlockId)?.type === 'CHECKLIST'
                ? 'bg-neutral-200 text-neutral-700'
                : 'text-neutral-500 hover:bg-neutral-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            체크리스트
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {isUploading ? '업로드 중...' : '파일'}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral-100 p-4">
        <button
          onClick={onCancel}
          className="rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="rounded-base bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          저장
        </button>
      </div>

    </div>
  )
}

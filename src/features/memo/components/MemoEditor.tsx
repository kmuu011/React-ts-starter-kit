import { useState, useRef, useEffect } from 'react'
import type { BlockType, MemoBlock } from '../api/memo.api'
import { useModalStore } from '@/shared/store/modalStore'

type EditorBlock = Omit<MemoBlock, 'idx'> & { tempId: string }

type MemoEditorProps = {
  initialTitle?: string | null
  initialBlocks?: MemoBlock[]
  onSave: (title: string | null, blocks: Omit<MemoBlock, 'idx'>[]) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function MemoEditor({
  initialTitle = '',
  initialBlocks = [],
  onSave,
  onCancel,
  isLoading = false,
}: MemoEditorProps) {
  const [title, setTitle] = useState(initialTitle || '')
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const { openModal, closeModal } = useModalStore()
  const shortcutsModalId = 'memo-shortcuts'
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => {
    if (initialBlocks.length > 0) {
      return initialBlocks.map((block, index) => ({
        ...block,
        tempId: `block-${index}-${Date.now()}`,
      }))
    }
    return [{ tempId: `block-0-${Date.now()}`, orderIndex: 0, type: 'TEXT' as BlockType, content: '' }]
  })
  const blockRefs = useRef<Map<string, HTMLTextAreaElement | HTMLInputElement>>(new Map())
  const focusTargetId = useRef<string | null>(null)
  const focusTargetPos = useRef<'start' | 'end' | number>('end')

  // 포커스 이동 함수 (커서 위치까지 강제)
  const focusBlock = (tempId: string, pos: 'start' | 'end' | number = 'end') => {
    focusTargetId.current = tempId
    focusTargetPos.current = pos

    // blocks 업데이트로 ref 등록된 다음에 실행되어야 하니까 rAF 2번 정도가 안전함
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = blockRefs.current.get(tempId)
        if (!el) return
        el.focus()

        const len =
          el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement
            ? el.value.length
            : 0

        let caret: number
        if (typeof pos === 'number') {
          // 숫자 위치인 경우, 텍스트 길이를 초과하지 않도록 제한
          caret = Math.min(pos, len)
        } else {
          caret = pos === 'start' ? 0 : len
        }
        
        if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
          el.setSelectionRange(caret, caret)
        }
      })
    })
  }

  const addBlock = (type: BlockType, afterIndex: number): string => {
    const newBlock: EditorBlock = {
      tempId: `block-${Date.now()}`,
      orderIndex: afterIndex + 1,
      type,
      content: '',
      ...(type === 'CHECKLIST' && { checked: false }),
    }

    const newBlocks = [...blocks]
    newBlocks.splice(afterIndex + 1, 0, newBlock)

    // orderIndex 재정렬
    newBlocks.forEach((block, index) => {
      block.orderIndex = index
    })

    setBlocks(newBlocks)
    focusBlock(newBlock.tempId, 'start')
    return newBlock.tempId
  }

  const updateBlock = (tempId: string, updates: Partial<EditorBlock>) => {
    setBlocks(blocks.map((block) =>
      block.tempId === tempId ? { ...block, ...updates } : block
    ))
  }

  const removeBlock = (tempId: string, currentIndex?: number) => {
    if (blocks.length <= 1) return

    const blockIndex = currentIndex ?? blocks.findIndex((block) => block.tempId === tempId)
    if (blockIndex < 0) return

    const newBlocks = blocks.filter((block) => block.tempId !== tempId)
    newBlocks.forEach((block, index) => {
      block.orderIndex = index
    })
    setBlocks(newBlocks)

    // 위 블록으로 포커스 이동 (삭제된 블록이 첫 번째가 아닌 경우)
    if (blockIndex > 0 && newBlocks.length > 0) {
      const previousBlockIndex = blockIndex - 1
      if (previousBlockIndex >= 0 && previousBlockIndex < newBlocks.length) {
        focusBlock(newBlocks[previousBlockIndex].tempId, 'end')
      }
    } else if (newBlocks.length > 0) {
      // 첫 번째 블록이 삭제된 경우, 새로운 첫 번째 블록으로 포커스
      focusBlock(newBlocks[0].tempId, 'start')
    }
  }

  const toggleChecklistType = () => {
    if (!focusedBlockId) return

    // 현재 커서 위치 저장
    let cursorPosition = 0
    const currentElement = blockRefs.current.get(focusedBlockId)
    if (currentElement instanceof HTMLTextAreaElement || currentElement instanceof HTMLInputElement) {
      cursorPosition = currentElement.selectionStart ?? 0
    }

    setBlocks(blocks.map((block) => {
      if (block.tempId !== focusedBlockId) return block

      if (block.type === 'CHECKLIST') {
        return { ...block, type: 'TEXT' as BlockType, checked: undefined }
      } else if (block.type === 'TEXT') {
        return { ...block, type: 'CHECKLIST' as BlockType, checked: false }
      }
      return block
    }))
    
    // 포커스 유지를 위해 같은 블록에 포커스 설정 (커서 위치 유지)
    focusBlock(focusedBlockId, cursorPosition)
  }

  const handleKeyDown = (e: React.KeyboardEvent, block: EditorBlock, index: number) => {
    // Alt+C: 텍스트/체크리스트 토글
    if (e.key === 'c' && (e.altKey || e.metaKey) && (block.type === 'TEXT' || block.type === 'CHECKLIST')) {
      e.preventDefault()
      toggleChecklistType()
      return
    }
    
    // Ctrl+Enter: 저장
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
      return
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const currentElement = e.target as HTMLElement
      
      let cursorPosition = 0
      let textBeforeCursor = ''
      let textAfterCursor = ''
      
      if (currentElement instanceof HTMLTextAreaElement) {
        cursorPosition = currentElement.selectionStart ?? 0
        textBeforeCursor = currentElement.value.substring(0, cursorPosition)
        textAfterCursor = currentElement.value.substring(cursorPosition)
      } else if (currentElement instanceof HTMLInputElement) {
        cursorPosition = currentElement.selectionStart ?? 0
        textBeforeCursor = currentElement.value.substring(0, cursorPosition)
        textAfterCursor = currentElement.value.substring(cursorPosition)
      }
      
      // 커서가 텍스트 중간에 있는 경우
      if (textAfterCursor.length > 0) {
        // 새 블록 생성
        const newBlock: EditorBlock = {
          tempId: `block-${Date.now()}`,
          orderIndex: index + 1,
          type: block.type,
          content: textAfterCursor,
          ...(block.type === 'CHECKLIST' && block.checked !== undefined && { checked: block.checked }),
        }
        
        // 현재 블록 내용 업데이트 및 새 블록 추가를 한 번에 처리
        const newBlocks = [...blocks]
        newBlocks[index] = { ...block, content: textBeforeCursor }
        newBlocks.splice(index + 1, 0, newBlock)
        
        // orderIndex 재정렬
        newBlocks.forEach((b, i) => {
          b.orderIndex = i
        })
        
        setBlocks(newBlocks)
        focusBlock(newBlock.tempId, 'start')
      } else {
        // 커서가 맨 끝에 있는 경우 기존 동작 (빈 새 블록 추가)
        const newBlockId = addBlock(block.type, index)
        focusBlock(newBlockId, 'start')
      }
      return
    }
    
    // Alt+방향키 위: 블록을 위로 이동
    if (e.key === 'ArrowUp' && (e.altKey || e.metaKey)) {
      if (index > 0) {
        e.preventDefault()
        const currentElement = e.target as HTMLElement
        let cursorPosition = 0
        
        if (currentElement instanceof HTMLTextAreaElement || currentElement instanceof HTMLInputElement) {
          cursorPosition = currentElement.selectionStart ?? 0
        }
        
        // 블록 순서 변경
        const newBlocks = [...blocks]
        const currentBlock = newBlocks[index]
        const previousBlock = newBlocks[index - 1]
        newBlocks[index] = previousBlock
        newBlocks[index - 1] = currentBlock
        
        // orderIndex 재정렬
        newBlocks.forEach((b, i) => {
          b.orderIndex = i
        })
        
        setBlocks(newBlocks)
        
        // 이동된 블록에 포커스 유지 (커서 위치 유지)
        focusBlock(currentBlock.tempId, cursorPosition)
      }
      return
    }
    
    // Alt+방향키 아래: 블록을 아래로 이동
    if (e.key === 'ArrowDown' && (e.altKey || e.metaKey)) {
      if (index < blocks.length - 1) {
        e.preventDefault()
        const currentElement = e.target as HTMLElement
        let cursorPosition = 0
        
        if (currentElement instanceof HTMLTextAreaElement || currentElement instanceof HTMLInputElement) {
          cursorPosition = currentElement.selectionStart ?? 0
        }
        
        // 블록 순서 변경
        const newBlocks = [...blocks]
        const currentBlock = newBlocks[index]
        const nextBlock = newBlocks[index + 1]
        newBlocks[index] = nextBlock
        newBlocks[index + 1] = currentBlock
        
        // orderIndex 재정렬
        newBlocks.forEach((b, i) => {
          b.orderIndex = i
        })
        
        setBlocks(newBlocks)
        
        // 이동된 블록에 포커스 유지 (커서 위치 유지)
        focusBlock(currentBlock.tempId, cursorPosition)
      }
      return
    }
    
    // 방향키 위: 이전 블록으로 이동
    if (e.key === 'ArrowUp') {
      if (index > 0) {
        e.preventDefault()
        const currentElement = e.target as HTMLElement
        let cursorPosition = 0
        
        if (currentElement instanceof HTMLTextAreaElement || currentElement instanceof HTMLInputElement) {
          cursorPosition = currentElement.selectionStart ?? 0
        }
        
        // 현재 커서 위치를 유지하여 위 블록으로 이동
        focusBlock(blocks[index - 1].tempId, cursorPosition)
      }
      return
    }
    
    // 방향키 아래: 다음 블록으로 이동
    if (e.key === 'ArrowDown') {
      if (index < blocks.length - 1) {
        e.preventDefault()
        const currentElement = e.target as HTMLElement
        let cursorPosition = 0
        
        if (currentElement instanceof HTMLTextAreaElement || currentElement instanceof HTMLInputElement) {
          cursorPosition = currentElement.selectionStart ?? 0
        }
        
        // 현재 커서 위치를 유지하여 아래 블록으로 이동
        focusBlock(blocks[index + 1].tempId, cursorPosition)
      }
      return
    }
    
    // Delete 키: 맨 마지막에서 누르면 아래 블록 내용을 현재 블록에 이어붙이기
    if (e.key === 'Delete') {
      const currentElement = e.target as HTMLElement
      const isAtEnd = 
        (currentElement instanceof HTMLTextAreaElement && 
         currentElement.selectionStart === currentElement.value.length &&
         currentElement.selectionEnd === currentElement.value.length) ||
        (currentElement instanceof HTMLInputElement && 
         currentElement.selectionStart === currentElement.value.length &&
         currentElement.selectionEnd === currentElement.value.length)
      
      if (isAtEnd && index < blocks.length - 1 && (block.type === 'TEXT' || block.type === 'CHECKLIST')) {
        const nextBlock = blocks[index + 1]
        if (nextBlock && (nextBlock.type === 'TEXT' || nextBlock.type === 'CHECKLIST')) {
          e.preventDefault()
          
          // 현재 커서 위치 저장 (맨 끝이므로 현재 블록의 길이)
          const cursorPosition = (block.content || '').length
          
          // 현재 블록 내용에 다음 블록 내용 이어붙이기
          const mergedContent = (block.content || '') + (nextBlock.content || '')
          
          // 다음 블록 삭제 및 현재 블록 내용 업데이트를 한 번에 처리
          const newBlocks = blocks
            .filter((b) => b.tempId !== nextBlock.tempId)
            .map((b) => {
              if (b.tempId === block.tempId) {
                return { ...b, content: mergedContent }
              }
              return b
            })
          newBlocks.forEach((b, i) => {
            b.orderIndex = i
          })
          setBlocks(newBlocks)
          
          // 포커스 유지 및 커서 위치 설정 (현재 커서 위치 유지)
          focusBlock(block.tempId, cursorPosition)
        }
      }
      return
    }
    
    if (e.key === 'Backspace') {
      const currentElement = e.target as HTMLElement
      const isAtStart = 
        (currentElement instanceof HTMLTextAreaElement && currentElement.selectionStart === 0) ||
        (currentElement instanceof HTMLInputElement && currentElement.selectionStart === 0)
      
      // 체크리스트 블록이고 커서가 맨 앞에 있을 때 TEXT로 변경
      if (block.type === 'CHECKLIST' && isAtStart) {
        e.preventDefault()
        // 현재 커서 위치 저장 (맨 앞이므로 0)
        const cursorPosition = 0
        updateBlock(block.tempId, { type: 'TEXT' as BlockType, checked: undefined })
        // 포커스 유지를 위해 같은 블록에 포커스 설정 (커서 위치 유지)
        focusBlock(block.tempId, cursorPosition)
        return
      }
      
      // 내용이 비어있을 때만 블록 삭제
      if (block.content === '') {
        // TEXT 블록이고 내용이 비어있으며 블록이 1개 이상이면 삭제
        if (block.type === 'TEXT' && blocks.length > 1) {
          e.preventDefault()
          removeBlock(block.tempId, index)
        }
      }
    }
  }

  // 새 블록 추가 후 포커스 이동
  useEffect(() => {
    if (focusTargetId.current) {
      const targetId = focusTargetId.current
      const pos = focusTargetPos.current
      // 먼저 focusedBlockId를 업데이트하여 버튼 활성화 상태 유지
      setFocusedBlockId(targetId)
      
      // focusBlock과 동일한 로직으로 포커스 및 커서 위치 설정
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = blockRefs.current.get(targetId)
          if (!el) return
          el.focus()

          const len =
            el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement
              ? el.value.length
              : 0

          let caret: number
          if (typeof pos === 'number') {
            // 숫자 위치인 경우, 텍스트 길이를 초과하지 않도록 제한
            caret = Math.min(pos, len)
          } else {
            caret = pos === 'start' ? 0 : len
          }
          
          if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            el.setSelectionRange(caret, caret)
          }
        })
      })
      
      focusTargetId.current = null
    }
  }, [blocks])

  const handleSave = () => {
    const saveBlocks = blocks.map(({ tempId, ...block }) => block)
    onSave(title || null, saveBlocks)
  }

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
      default:
        return null
    }
  }

  return (
    <div className="rounded-base border border-neutral-200 bg-white">
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
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">저장</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded">
                        Ctrl + Enter
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">텍스트/체크리스트 토글</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded">
                        Alt + C
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">블록 위로 이동</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded">
                        Alt + ↑
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">블록 아래로 이동</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded">
                        Alt + ↓
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">이전 블록으로 이동</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded">
                        ↑
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">다음 블록으로 이동</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded">
                        ↓
                      </kbd>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => closeModal(shortcutsModalId)}
                      className="w-full rounded-base bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      닫기
                    </button>
                  </div>
                </>
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
            <div key={block.tempId} className="group flex items-start gap-2">
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
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral-100 p-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-base bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>
      </div>

    </div>
  )
}

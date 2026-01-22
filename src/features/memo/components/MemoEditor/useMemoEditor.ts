import { useState, useRef, useEffect } from 'react'
import type { BlockType, MemoBlock, FileInfo } from '../../api/memo.api'
import { uploadFilesApi } from '../../api/memo.api'

export type EditorBlock = Omit<MemoBlock, 'idx'> & {
  tempId: string
  previewUrl?: string
  originalFileName?: string // 업로드한 파일의 원본 이름
}

interface UseMemoEditorProps {
  initialTitle?: string | null
  initialBlocks?: MemoBlock[]
  onSave: (title: string | null, blocks: Omit<MemoBlock, 'idx'>[]) => void
}

export const useMemoEditor = ({ initialTitle, initialBlocks, onSave }: UseMemoEditorProps) => {
  const [title, setTitle] = useState(initialTitle || '')
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => {
    if (initialBlocks && initialBlocks.length > 0) {
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
    const saveBlocks = blocks.map(({ tempId, previewUrl, originalFileName, ...block }) => block)
    onSave(title || null, saveBlocks)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const fileArray = Array.from(files)
      const response = await uploadFilesApi(fileArray)

      if (response?.data && response.data.length > 0) {
        const focusedIndex = focusedBlockId
          ? blocks.findIndex((b) => b.tempId === focusedBlockId)
          : blocks.length - 1
        const insertIndex = focusedIndex >= 0 ? focusedIndex : blocks.length - 1

        const newBlocks = [...blocks]

        // 이미지 크기 로드를 위한 Promise 배열
        const imageSizePromises = response.data.map((fileInfo: FileInfo, i: number) => {
          return new Promise<EditorBlock>((resolve) => {
            const originalFile = fileArray[i]
            const isImageFile = originalFile.type.startsWith('image/')

            if (isImageFile) {
              const img = new Image()
              const objectUrl = URL.createObjectURL(originalFile)

              img.onload = () => {
                URL.revokeObjectURL(objectUrl)

                // 최대 너비 600px로 제한하고 비율에 맞게 높이 조정
                const maxWidth = 600
                let displayWidth = img.naturalWidth
                let displayHeight = img.naturalHeight

                if (displayWidth > maxWidth) {
                  const ratio = maxWidth / displayWidth
                  displayWidth = maxWidth
                  displayHeight = Math.round(displayHeight * ratio)
                }

                resolve({
                  tempId: `block-${Date.now()}-${i}`,
                  orderIndex: insertIndex + 1 + i,
                  type: 'FILE' as BlockType,
                  fileIdx: fileInfo.idx,
                  file: fileInfo as any,
                  displayWidth,
                  displayHeight,
                })
              }

              img.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                resolve({
                  tempId: `block-${Date.now()}-${i}`,
                  orderIndex: insertIndex + 1 + i,
                  type: 'FILE' as BlockType,
                  fileIdx: fileInfo.idx,
                  file: fileInfo as any,
                })
              }

              img.src = objectUrl
            } else {
              // 이미지가 아닌 경우
              resolve({
                tempId: `block-${Date.now()}-${i}`,
                orderIndex: insertIndex + 1 + i,
                type: 'FILE' as BlockType,
                fileIdx: fileInfo.idx,
                file: fileInfo as any,
              })
            }
          })
        })

        // 모든 이미지 크기 로드 완료 대기
        const newFileBlocks = await Promise.all(imageSizePromises)

        // 한 번에 모든 블록을 삽입 (역순 문제 해결)
        newBlocks.splice(insertIndex + 1, 0, ...newFileBlocks)

        // 파일 업로드 후 새로운 TEXT 블록 생성
        const newTextBlock: EditorBlock = {
          tempId: `block-text-${Date.now()}`,
          orderIndex: insertIndex + 1 + newFileBlocks.length,
          type: 'TEXT' as BlockType,
          content: '',
        }
        newBlocks.splice(insertIndex + 1 + newFileBlocks.length, 0, newTextBlock)

        // orderIndex 재정렬
        newBlocks.forEach((block, index) => {
          block.orderIndex = index
        })

        setBlocks(newBlocks)

        // 새로 생성한 TEXT 블록에 포커스
        focusBlock(newTextBlock.tempId, 'start')
      }
    } finally {
      setIsUploading(false)
      // input 초기화
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 드래그 중
  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverBlockId(blockId)
  }

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedBlockId(null)
    setDragOverBlockId(null)
  }

  // 드롭
  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault()

    if (!draggedBlockId || draggedBlockId === targetBlockId) {
      setDraggedBlockId(null)
      setDragOverBlockId(null)
      return
    }

    const draggedIndex = blocks.findIndex((b) => b.tempId === draggedBlockId)
    const targetIndex = blocks.findIndex((b) => b.tempId === targetBlockId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBlocks = [...blocks]
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, draggedBlock)

    // orderIndex 재정렬
    newBlocks.forEach((block, index) => {
      block.orderIndex = index
    })

    setBlocks(newBlocks)
    setDraggedBlockId(null)
    setDragOverBlockId(null)
  }

  return {
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
  }
}

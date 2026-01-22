import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_CHECK_LIST_COMMAND } from '@lexical/list'
import { mergeRegister } from '@lexical/utils'
import { INSERT_IMAGE_COMMAND } from './ImagesPlugin'
import { INSERT_VIDEO_COMMAND } from './VideosPlugin'
import { INSERT_FILE_COMMAND } from './FilesPlugin'
import { uploadFilesApi } from '../../api/memo.api'
import { getStaticFileUrl } from '../../api/memo.api'

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))

      const node = selection.anchor.getNode()
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        1
      )
    )
  }, [editor, updateToolbar])

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt('링크 URL을 입력하세요:')
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const fileArray = Array.from(files)
      const response = await uploadFilesApi(fileArray)

      if (response?.data && response.data.length > 0) {
        for (const fileInfo of response.data) {
          const src = getStaticFileUrl(fileInfo.fileKey)

          // 이미지 크기 로드
          const img = new Image()
          img.src = src

          await new Promise<void>((resolve) => {
            img.onload = () => {
              const maxWidth = 600
              let width = img.naturalWidth
              let height = img.naturalHeight

              if (width > maxWidth) {
                const ratio = maxWidth / width
                width = maxWidth
                height = Math.round(height * ratio)
              }

              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: fileInfo.fileName,
                src,
                width,
                height,
              })
              resolve()
            }

            img.onerror = () => {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: fileInfo.fileName,
                src,
              })
              resolve()
            }
          })
        }
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    }

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [editor])

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const fileArray = Array.from(files)
      const response = await uploadFilesApi(fileArray)

      if (response?.data && response.data.length > 0) {
        for (const fileInfo of response.data) {
          const src = getStaticFileUrl(fileInfo.fileKey)

          editor.dispatchCommand(INSERT_VIDEO_COMMAND, {
            src,
            width: 600,
          })
        }
      }
    } catch (error) {
      console.error('Video upload failed:', error)
    }

    // input 초기화
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }, [editor])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const fileArray = Array.from(files)

      // 파일 이름과 크기, 확장자를 매핑
      const fileMetaMap = new Map<string, { size: number; originalName: string }>()
      fileArray.forEach(file => {
        fileMetaMap.set(file.name, {
          size: file.size,
          originalName: file.name
        })
      })

      const response = await uploadFilesApi(fileArray)

      if (response?.data && response.data.length > 0) {
        for (const fileInfo of response.data) {
          const src = getStaticFileUrl(fileInfo.fileKey)
          const meta = fileMetaMap.get(fileInfo.fileName)

          // fileKey에서 확장자 추출
          const keyExtension = fileInfo.fileKey.substring(fileInfo.fileKey.lastIndexOf('.'))
          const fileName = meta?.originalName || fileInfo.fileName

          // fileName에 확장자가 없으면 fileKey에서 추출한 확장자 추가
          const finalFileName = fileName.includes('.') ? fileName : fileName + keyExtension

          editor.dispatchCommand(INSERT_FILE_COMMAND, {
            fileName: finalFileName,
            src,
            fileSize: meta?.size,
          })
        }
      }
    } catch (error) {
      console.error('File upload failed:', error)
    }

    // input 초기화
    if (documentInputRef.current) {
      documentInputRef.current.value = ''
    }
  }, [editor])

  return (
    <div className="flex items-center gap-1 border-b border-neutral-200 p-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleVideoUpload}
      />
      <input
        ref={documentInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`rounded p-2 hover:bg-neutral-100 ${isBold ? 'bg-neutral-200' : ''}`}
        title="굵게 (Ctrl+B)"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`rounded p-2 hover:bg-neutral-100 ${isItalic ? 'bg-neutral-200' : ''}`}
        title="기울임 (Ctrl+I)"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`rounded p-2 hover:bg-neutral-100 ${isUnderline ? 'bg-neutral-200' : ''}`}
        title="밑줄 (Ctrl+U)"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v8a5 5 0 0010 0V4M5 20h14" />
        </svg>
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300" />

      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        className="rounded p-2 hover:bg-neutral-100"
        title="왼쪽 정렬"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        className="rounded p-2 hover:bg-neutral-100"
        title="가운데 정렬"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
        </svg>
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        className="rounded p-2 hover:bg-neutral-100"
        title="오른쪽 정렬"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
        </svg>
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300" />

      <button
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="rounded p-2 hover:bg-neutral-100"
        title="글머리 기호 목록"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="3" cy="6" r="1" fill="currentColor" />
          <circle cx="3" cy="12" r="1" fill="currentColor" />
          <circle cx="3" cy="18" r="1" fill="currentColor" />
        </svg>
      </button>

      <button
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="rounded p-2 hover:bg-neutral-100"
        title="번호 매기기 목록"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13" />
          <text x="2" y="8" fontSize="8" fill="currentColor">1</text>
          <text x="2" y="14" fontSize="8" fill="currentColor">2</text>
          <text x="2" y="20" fontSize="8" fill="currentColor">3</text>
        </svg>
      </button>

      <button
        onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}
        className="rounded p-2 hover:bg-neutral-100"
        title="체크리스트"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300" />

      <button
        onClick={insertLink}
        className={`rounded p-2 hover:bg-neutral-100 ${isLink ? 'bg-neutral-200' : ''}`}
        title="링크"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-300" />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded p-2 hover:bg-neutral-100"
        title="이미지 업로드"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <button
        onClick={() => videoInputRef.current?.click()}
        className="rounded p-2 hover:bg-neutral-100"
        title="비디오 업로드"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      <button
        onClick={() => documentInputRef.current?.click()}
        className="rounded p-2 hover:bg-neutral-100"
        title="파일 업로드"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    </div>
  )
}

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode, $isListItemNode, $isListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { useEffect, useRef } from 'react'
import type { EditorState } from 'lexical'
import { $getRoot, $getSelection, $isRangeSelection, $getNodeByKey } from 'lexical'
import ToolbarPlugin from './ToolbarPlugin'
import ImagesPlugin from './ImagesPlugin'
import { ImageNode } from './ImageNode'
import VideosPlugin from './VideosPlugin'
import { VideoNode } from './VideoNode'
import FilesPlugin from './FilesPlugin'
import { FileNode } from './FileNode'
import '../../lexical.css'

const theme = {
  paragraph: 'mb-2',
  quote: 'border-l-4 border-neutral-300 pl-4 italic text-neutral-600',
  heading: {
    h1: 'text-3xl font-bold mb-4',
    h2: 'text-2xl font-bold mb-3',
    h3: 'text-xl font-bold mb-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-4',
    ul: 'list-disc ml-4',
    listitem: 'ml-4',
    checklist: 'lexical-checklist',
    listitemChecked: 'lexical-list-item-checked',
    listitemUnchecked: 'lexical-list-item-unchecked',
  },
  link: 'text-brand-3 underline cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-neutral-100 px-1 py-0.5 rounded font-mono text-sm',
  },
}

function onError(error: Error) {
  console.error(error)
}

type LexicalEditorProps = {
  initialEditorState?: string | object | null
  editable?: boolean
  onSave?: (editorState: EditorState) => void
  onCancel?: () => void
  onCheckboxToggle?: (editorState: EditorState) => void
}

export default function LexicalEditor({
  initialEditorState = null,
  editable = true,
  onSave,
  onCancel,
  onCheckboxToggle,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError,
    editable,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      ImageNode,
      VideoNode,
      FileNode,
    ],
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative rounded-base border border-neutral-200 bg-white">
        {editable && <ToolbarPlugin />}
        <div className="relative p-4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`min-h-[400px] outline-none ${!editable ? 'cursor-default' : ''}`}
                contentEditable={editable}
              />
            }
            placeholder={
              editable ? (
                <div className="pointer-events-none absolute top-4 left-4 text-neutral-400">
                  메모를 입력하세요...
                </div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {editable && <AutoFocusPlugin />}
          <ListPlugin />
          <CheckListPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <VideosPlugin />
          <FilesPlugin />
          {initialEditorState && (
            <InitialStatePlugin initialEditorState={initialEditorState} />
          )}
          {!editable && onCheckboxToggle && (
            <>
              <ReadOnlyPlugin />
              <CheckboxTogglePlugin onCheckboxToggle={onCheckboxToggle} />
            </>
          )}
          {editable && (onSave || onCancel) && (
            <SaveButtonPlugin onSave={onSave} onCancel={onCancel} />
          )}
        </div>
      </div>
    </LexicalComposer>
  )
}

function InitialStatePlugin({ initialEditorState }: { initialEditorState: string | object | null }) {
  const [editor] = useLexicalComposerContext()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || !initialEditorState) return

    try {
      // JSON 파싱 (문자열이면 파싱, 객체면 그대로 사용)
      let parsedState: any
      if (typeof initialEditorState === 'string') {
        try {
          parsedState = JSON.parse(initialEditorState)
        } catch (e) {
          console.error('Failed to parse JSON string:', e)
          isInitialized.current = true
          return
        }
      } else {
        parsedState = initialEditorState
      }

      if (!parsedState || !parsedState.root) {
        console.warn('Invalid editor state: missing root', parsedState)
        isInitialized.current = true
        return
      }

      // Lexical의 parseEditorState를 사용하여 상태 로드
      // JSON 문자열로 변환하여 parseEditorState에 전달
      const stateString = JSON.stringify(parsedState)
      const editorState = editor.parseEditorState(stateString)
      editor.setEditorState(editorState)
      
      isInitialized.current = true
    } catch (e) {
      console.error('Failed to load initial editor state:', e, initialEditorState)
      isInitialized.current = true
    }
  }, [editor, initialEditorState])

  return null
}

function ReadOnlyPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // 키보드 입력 차단 (체크박스 토글을 위한 Space/Enter는 CheckboxTogglePlugin에서 처리)
    const rootElement = editor.getRootElement()
    if (rootElement) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // 체크박스 토글을 위한 Space 키는 허용
        if (e.key === ' ' || e.key === 'Enter') {
          const selection = editor.getEditorState().read(() => $getSelection())
          if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode()
            let listItemNode = node
            while (listItemNode && !$isListItemNode(listItemNode)) {
              const parent = listItemNode.getParent()
              if (!parent) break
              listItemNode = parent
            }
            if ($isListItemNode(listItemNode)) {
              const parent = listItemNode.getParent()
              if (parent && $isListNode(parent) && parent.getListType() === 'check') {
                return // 체크리스트 항목에서는 Space/Enter 허용
              }
            }
          }
        }
        // 다른 키 입력은 차단
        if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
          e.preventDefault()
        }
      }

      rootElement.addEventListener('keydown', handleKeyDown)
      return () => {
        rootElement.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [editor])

  return null
}

function CheckboxTogglePlugin({ onCheckboxToggle }: { onCheckboxToggle: (editorState: EditorState) => void }) {
  const [editor] = useLexicalComposerContext()
  const pendingSaveRef = useRef<{ nodeKey: string; newChecked: boolean } | null>(null)

  useEffect(() => {
    // 체크박스 토글로 인한 업데이트를 감지하여 저장
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (pendingSaveRef.current) {
        const { nodeKey, newChecked } = pendingSaveRef.current
        pendingSaveRef.current = null
        
        // 실제로 값이 변경되었는지 확인
        editorState.read(() => {
          try {
            const node = $getNodeByKey(nodeKey)
            if (node && $isListItemNode(node)) {
              const currentChecked = node.getChecked() ?? false
              // 예상한 값과 일치하면 저장
              if (currentChecked === newChecked) {
                setTimeout(() => {
                  onCheckboxToggle(editorState)
                }, 0)
              }
            }
          } catch (e) {
            // 노드를 찾을 수 없으면 저장하지 않음
          }
        })
      }
    })

    return () => {
      unregister()
    }
  }, [editor, onCheckboxToggle])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // 체크리스트 항목 찾기 (ul.lexical-checklist 내의 li 요소)
      const checklist = target.closest('ul.lexical-checklist')
      if (!checklist) return
      
      const listItem = target.closest('li.lexical-list-item-checked, li.lexical-list-item-unchecked')
      if (!listItem) return

      // 체크박스 영역 클릭인지 확인 (왼쪽 28px 영역)
      const rect = listItem.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      
      if (clickX <= 28) {
        event.preventDefault()
        event.stopPropagation()

        // editor.update 내에서 노드를 찾고 토글하기
        editor.update(() => {
          const root = $getRoot()
          const allListItems: ListItemNode[] = []
          
          // 모든 ListItemNode 수집 (안전하게)
          function collectListItems(node: any) {
            if ($isListItemNode(node)) {
              allListItems.push(node)
            }
            // getChildren()이 있는 노드만 처리
            if (node && typeof node.getChildren === 'function') {
              try {
                const children = node.getChildren()
                if (children && Array.isArray(children)) {
                  for (const child of children) {
                    collectListItems(child)
                  }
                }
              } catch (e) {
                // 에러 발생 시 해당 노드의 children은 건너뛰기
              }
            }
          }
          
          collectListItems(root)
          
          // 클릭된 DOM 요소에 해당하는 노드 찾기
          let clickedNode: ListItemNode | null = null
          
          for (const node of allListItems) {
            try {
              const nodeKey = node.getKey()
              const domNode = editor.getElementByKey(nodeKey)
              
              // DOM 요소가 정확히 일치하거나 포함 관계인지 확인
              if (domNode) {
                if (domNode === listItem || listItem.contains(domNode) || domNode.contains(listItem)) {
                  clickedNode = node
                  break
                }
              }
            } catch (e) {
              continue
            }
          }

          if (clickedNode && $isListItemNode(clickedNode)) {
            // 부모가 체크리스트인지 확인
            const parent = clickedNode.getParent()
            if (parent && $isListNode(parent) && parent.getListType() === 'check') {
              const checked = clickedNode.getChecked() ?? false
              const newChecked = !checked
              // checked가 true면 false로, false면 true로 토글
              clickedNode.setChecked(newChecked)
              
              // 저장을 위해 노드 키와 새로운 상태 저장
              const nodeKey = clickedNode.getKey()
              pendingSaveRef.current = { nodeKey, newChecked }
            }
          }
        })
      }
    }

    const rootElement = editor.getRootElement()
    if (rootElement) {
      rootElement.addEventListener('click', handleClick, true)
      return () => {
        rootElement.removeEventListener('click', handleClick, true)
      }
    }
  }, [editor])

  return null
}

function SaveButtonPlugin({ onSave, onCancel }: {
  onSave?: (editorState: EditorState) => void
  onCancel?: () => void
}) {
  const [editor] = useLexicalComposerContext()

  const handleSave = () => {
    if (onSave) {
      const editorState = editor.getEditorState()
      onSave(editorState)
    }
  }

  return (
    <div className="border-t border-neutral-200 p-4 flex justify-end gap-2">
      {onCancel && (
        <button
          onClick={onCancel}
          className="btn btn-secondary w-auto h-auto px-4 py-2 text-sm"
        >
          취소
        </button>
      )}
      {onSave && (
        <button
          onClick={handleSave}
          className="btn btn-primary w-auto h-auto px-4 py-2 text-sm"
        >
          저장
        </button>
      )}
    </div>
  )
}

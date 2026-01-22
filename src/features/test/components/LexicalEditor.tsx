import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import ToolbarPlugin from './ToolbarPlugin'
import ImagesPlugin from './ImagesPlugin'
import { ImageNode } from './ImageNode'
import VideosPlugin from './VideosPlugin'
import { VideoNode } from './VideoNode'
import FilesPlugin from './FilesPlugin'
import { FileNode } from './FileNode'
import SavePlugin from './SavePlugin'
import '../lexical.css'

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

export default function LexicalEditor() {
  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
    onError,
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
        <ToolbarPlugin />
        <div className="relative p-4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute top-4 left-4 text-neutral-400">
                메모를 입력하세요...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <VideosPlugin />
          <FilesPlugin />
        </div>
        <SavePlugin />
      </div>
    </LexicalComposer>
  )
}

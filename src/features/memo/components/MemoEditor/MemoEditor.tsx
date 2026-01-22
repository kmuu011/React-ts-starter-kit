import { useState } from 'react'
import type { EditorState } from 'lexical'
import LexicalEditor from '../LexicalEditor/LexicalEditor'

type MemoEditorProps = {
  initialTitle?: string | null
  initialContent?: string | object | null
  onSave: (title: string | null, content: EditorState) => void
  onCancel: () => void
}

export default function MemoEditor({
  initialTitle = '',
  initialContent = null,
  onSave,
  onCancel,
}: MemoEditorProps) {
  const [title, setTitle] = useState(initialTitle || '')

  const handleSave = (editorState: EditorState) => {
    onSave(title || null, editorState)
  }

  return (
    <div className="rounded-base border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요..."
          className="w-full border-0 bg-transparent p-0 text-lg font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-0"
        />
      </div>

      <LexicalEditor
        initialEditorState={initialContent}
        editable={true}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </div>
  )
}

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export default function SavePlugin() {
  const [editor] = useLexicalComposerContext()

  const handleSave = () => {
    const editorState = editor.getEditorState()
    const json = editorState.toJSON()
    console.log('서버 저장용 JSON:', json)

    // 여기서 실제 서버 저장 로직 추가
    // await saveToServer({ content: json })
  }

  return (
    <div className="border-t border-neutral-200 p-4">
      <button
        onClick={handleSave}
        className="rounded-base bg-brand-3 px-4 py-2 text-white hover:bg-brand-4 transition-colors"
      >
        저장
      </button>
    </div>
  )
}

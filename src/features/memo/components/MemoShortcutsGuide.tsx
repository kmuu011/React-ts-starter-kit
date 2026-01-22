type MemoShortcutsGuideProps = {
  onClose: () => void
}

export default function MemoShortcutsGuide({ onClose }: MemoShortcutsGuideProps) {
  return (
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
          onClick={onClose}
          className="w-full rounded-base bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          닫기
        </button>
      </div>
    </>
  )
}

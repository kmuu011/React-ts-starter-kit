import LexicalEditor from '../components/LexicalEditor'

export default function LexicalTestPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Lexical 에디터 테스트</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Lexical 에디터를 테스트해보세요. 리치 텍스트, 목록, 링크 등을 지원합니다.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">제목</h2>
        <input
          type="text"
          placeholder="제목을 입력하세요..."
          className="w-full rounded-base border border-neutral-200 bg-white px-4 py-2 text-neutral-900 placeholder-neutral-400 focus:border-brand-3 focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">내용</h2>
        <LexicalEditor />
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-base border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
          취소
        </button>
        <button className="rounded-base bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">
          저장
        </button>
      </div>

      <div className="mt-8 rounded-base border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-2 font-semibold text-neutral-900">단축키</h3>
        <ul className="space-y-1 text-sm text-neutral-600">
          <li><kbd className="rounded bg-white px-2 py-0.5">Ctrl+B</kbd> - 굵게</li>
          <li><kbd className="rounded bg-white px-2 py-0.5">Ctrl+I</kbd> - 기울임</li>
          <li><kbd className="rounded bg-white px-2 py-0.5">Ctrl+U</kbd> - 밑줄</li>
          <li><kbd className="rounded bg-white px-2 py-0.5">Ctrl+Z</kbd> - 되돌리기</li>
          <li><kbd className="rounded bg-white px-2 py-0.5">Ctrl+Shift+Z</kbd> - 다시 실행</li>
        </ul>
      </div>
    </div>
  )
}

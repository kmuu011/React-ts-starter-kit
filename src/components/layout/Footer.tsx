export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} React Starter Kit. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm">
            <a href="/terms" className="text-brand-3 hover:text-brand-5 hover:underline">
              이용약관
            </a>
            <a href="/privacy" className="text-brand-3 hover:text-brand-5 hover:underline">
              개인정보처리방침
            </a>
            <a href="/support" className="text-brand-3 hover:text-brand-5 hover:underline">
              고객센터
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

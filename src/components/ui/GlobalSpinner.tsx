import { useLoadingStore } from '@/shared/store/loadingStore'

export default function GlobalSpinner() {
  const loadingCount = useLoadingStore((state) => state.loadingCount)

  if (loadingCount <= 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-5 shadow-lg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
        <p className="text-sm text-gray-700">로딩중...</p>
      </div>
    </div>
  );
}

import { useToastStore } from '@/shared/store/toastStore';

export default function ToastMessage() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`
            flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg cursor-pointer
            ${getToastStyles(toast.type)}
          `}
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <span className="flex-shrink-0 text-lg font-bold">{getIcon(toast.type)}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

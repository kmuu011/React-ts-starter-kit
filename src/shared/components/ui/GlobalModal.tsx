import { useEffect } from 'react'
import { useModalStore } from '@/shared/store/modalStore'

export default function GlobalModal() {
  const { modals, closeModal } = useModalStore()

  // ESC 키로 닫기
  useEffect(() => {
    const openModals = Object.values(modals).filter((m) => m.isOpen)
    if (openModals.length === 0) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 가장 최근에 열린 모달 닫기
        const lastModal = openModals[openModals.length - 1]
        if (lastModal) {
          closeModal(lastModal.id)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [modals, closeModal])

  // body 스크롤 방지
  useEffect(() => {
    const hasOpenModal = Object.values(modals).some((m) => m.isOpen)
    if (hasOpenModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modals])

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <>
      {Object.values(modals).map((modal) => {
        if (!modal.isOpen) return null

        return (
          <div
            key={modal.id}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-modal-overlay"
            onClick={() => closeModal(modal.id)}
          >
            <div
              className={`bg-white rounded-lg shadow-xl w-full mx-4 ${maxWidthClasses[modal.maxWidth ?? 'md']}`}
              onClick={(e) => e.stopPropagation()}
            >
              {(modal.title || modal.showCloseButton) && (
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                  {modal.title && (
                    <h3 className="text-lg font-semibold text-neutral-900">{modal.title}</h3>
                  )}
                  {modal.showCloseButton && (
                    <button
                      onClick={() => closeModal(modal.id)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 transition ml-auto"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <div className="p-4">{modal.content}</div>
            </div>
          </div>
        )
      })}
    </>
  )
}

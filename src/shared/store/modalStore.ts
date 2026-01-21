import { create } from 'zustand'
import { ReactNode } from 'react'

type ModalConfig = {
  id: string
  isOpen: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  content?: ReactNode
}

type ModalState = {
  modals: Record<string, ModalConfig>
  openModal: (id: string, config?: Omit<ModalConfig, 'id' | 'isOpen'>) => void
  closeModal: (id: string) => void
  toggleModal: (id: string, config?: Omit<ModalConfig, 'id' | 'isOpen'>) => void
}

export const useModalStore = create<ModalState>((set) => ({
  modals: {},

  openModal: (id: string, config?: Omit<ModalConfig, 'id' | 'isOpen'>) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: {
          id,
          isOpen: true,
          maxWidth: 'md',
          showCloseButton: true,
          ...config,
        },
      },
    }))
  },

  closeModal: (id: string) => {
    set((state) => {
      const newModals = { ...state.modals }
      if (newModals[id]) {
        newModals[id] = { ...newModals[id], isOpen: false }
      }
      return { modals: newModals }
    })
  },

  toggleModal: (id: string, config?: Omit<ModalConfig, 'id' | 'isOpen'>) => {
    set((state) => {
      const currentModal = state.modals[id]
      const isOpen = !currentModal?.isOpen

      return {
        modals: {
          ...state.modals,
          [id]: {
            id,
            isOpen,
            maxWidth: 'md',
            showCloseButton: true,
            ...config,
          },
        },
      }
    })
  },
}))

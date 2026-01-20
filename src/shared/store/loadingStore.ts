import { create } from "zustand";

type LoadingState = {
  loadingCount: number;
  startLoading: () => void;
  endLoading: () => void;
  resetLoading: () => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  loadingCount: 0,

  startLoading: () =>
    set((state) => ({
      loadingCount: state.loadingCount + 1,
    })),

  endLoading: () =>
    set((state) => ({
      // 음수 방지
      loadingCount: Math.max(0, state.loadingCount - 1),
    })),

  resetLoading: () =>
    set(() => ({
      loadingCount: 0,
    })),
}));

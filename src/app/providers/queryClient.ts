import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                 // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 탭 다시 올 때 자동 refetch 끔
    },
  },
})

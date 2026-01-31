/**
 * 라우터 경로 상수
 * 모든 경로는 이 파일에서 관리하며, 하드코딩된 경로 문자열 대신 이 상수를 사용해야 합니다.
 */
export const ROUTER_PATHS = {
  // 루트
  ROOT: '/',
  
  // 인증
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  
  // 메모
  MEMO: {
    ROOT: '/memo',
    LIST: '/memo/list',
    CREATE: '/memo/create',
    DETAIL: (memoIdx: number | string) => `/memo/${memoIdx}`,
    EDIT: (memoIdx: number | string) => `/memo/${memoIdx}/edit`,
  },

  // 테스트
  TEST: {
    LEXICAL: '/test/lexical',
  },
} as const

/**
 * 메모 상세 페이지 경로 생성 헬퍼
 */
export const getMemoDetailPath = (memoIdx: number | string) => ROUTER_PATHS.MEMO.DETAIL(memoIdx)

/**
 * 메모 수정 페이지 경로 생성 헬퍼
 */
export const getMemoEditPath = (memoIdx: number | string) => ROUTER_PATHS.MEMO.EDIT(memoIdx)

# 프로젝트 구조/스택 설명 (Vite + React + TS)

이 프로젝트는 **도메인(기능) 단위로 폴더를 분리**하고,  
**서버 상태 / 클라이언트 상태 / UI 공용 컴포넌트 / 앱 전역 설정**을 명확히 나눠서 유지보수하기 쉽게 구성되어 있습니다.

---

## 사용 기술(스택) 목적

### 1) React + TypeScript
- 화면(UI)을 컴포넌트 기반으로 개발하기 위한 프레임워크
- TypeScript로 **props / API 응답 / 상태 타입**을 명확히 해서 런타임 오류를 줄이고 유지보수성을 올림

---

### 2) Tailwind CSS
- CSS를 별도로 길게 작성하기보다 **유틸리티 클래스 기반으로 빠르게 UI 구성**
- `tailwind.config.*` 기반으로 색상/폰트/간격 등을 통일해서 **디자인 일관성 유지**

---

### 3) Zustand (클라이언트 전역 상태)
Redux처럼 Provider로 감싸지 않고도 쓸 수 있는 가벼운 전역 상태 관리 도구.

이 프로젝트에서 Zustand는 “서버에서 가져온 데이터”가 아니라, 아래 같은 **클라이언트 상태(UI 상태)**를 관리하는 용도로 사용합니다.

**예시**
- 선택된 월/날짜
- 필터 상태(카테고리, 수입/지출, 정렬)
- 모달 열림/닫힘
- 임시 입력값(폼 진행 상태)

---

### 4) React Query (TanStack Query) (서버 상태/캐시)
API 호출 결과를 전역 캐시로 관리하는 라이브러리.

이 프로젝트에서 React Query는 아래 목적입니다.
- API 조회 결과 캐싱
- 로딩/에러/성공 상태 표준화
- refetch 정책 관리
- 서버 데이터 동기화

즉, **서버에서 가져오는 데이터는 React Query가 담당**하고,  
Zustand는 **UI 상태만 담당**하도록 역할을 분리합니다.

---

### 5) Axios (API 모듈화)
`fetch`를 컴포넌트마다 직접 호출하지 않고,  
**axios 인스턴스 + 공통 request 래퍼 + 도메인별 API 함수** 형태로 통일합니다.

**목적**
- baseURL / timeout / header / 토큰 처리 통합
- 에러 처리 규칙 통일
- API 호출 코드 중복 제거

---

### 6) React Router DOM (라우팅)
URL 기반 페이지 이동을 처리하기 위해 사용합니다.

**예시**
- `/` (루트)
- `/login`
- `/signup`
- `/memo`
- `/memo/list`
- `/admin/*` (관리자 레이아웃 분리 가능)

또한 `/admin`과 `/` 경로에서 서로 다른 레이아웃을 적용할 수 있도록 구성합니다.

---

## 폴더 구조

src/
  app/
  api/
  shared/
  components/
  features/

## `src/app/` (앱 전역 뼈대)

앱 전체에서 1번만 적용되는 설정을 모아둡니다.

**예시**
- Provider 묶음(AppProviders)
- React Query QueryClient 생성/설정
- Router 설정(routes.tsx)
- Layout 구성(PublicLayout / AdminLayout 등)

---

## `src/api/` (공용 API 인프라)

여기는 “도메인 API 호출”을 두는 곳이 아니라,  
axios 인스턴스 / request 래퍼 같은 공용 기반만 둡니다.

**예시**
- axios instance (interceptor 포함)
- `request({ method, url, params, data })` 같은 공통 요청 함수

도메인별 API는 `features/*/api`로 내려가서 관리합니다.

---

## `src/shared/` (공용 로직/유틸/상수)

여러 도메인에서 공통으로 사용하는 로직을 모읍니다.

**예시**
- 날짜 파싱 함수 (`dateToObject`, `toDateParser`)
- 숫자 포맷 (`commaParser`)
- 공용 상수(dayStrList 등)
- 공용 타입

> 컴포넌트가 아니라 **로직 중심**으로 두는 폴더입니다.

---

## `src/components/` (공용 UI 컴포넌트)

여러 도메인에서 재사용되는 컴포넌트를 모읍니다.

**예시**
- Header, Footer
- 공용 버튼/모달/인풋 같은 UI

**추천 예시 구조**
```txt
src/components/
  layout/
    Header.tsx
    Footer.tsx
  ui/
    Modal.tsx
    Spinner.tsx
```
## `src/features/` (도메인 단위 기능)

프로젝트의 핵심 구조입니다.

각 도메인(기능)별로 폴더를 만들고 그 안에 페이지/컴포넌트/API/스토어/타입을 묶습니다.

---

## 예시

```text
src/features/
  auth/
    pages/
    components/
    api/
    store/
    types/

  memo/
    pages/
    components/
    api/
    store/
    hooks/
    types/
```

## 도메인 폴더 안에서 보통 나누는 기준

pages/ : 라우팅되는 화면 단위 컴포넌트

components/ : 해당 도메인에서만 쓰는 UI 조각

api/ : 해당 도메인의 API 호출 함수들

store/ : 해당 도메인의 Zustand store

hooks/ : 해당 도메인의 React Query hooks (useQuery / useMutation)

types/ : 해당 도메인의 타입 정의

## 라우팅과 레이아웃 구조

공용 Header/Footer가 필요한 경우,
라우팅은 routes.tsx에서 레이아웃을 분리하고 Outlet을 통해 페이지를 렌더링합니다.

/ 경로: PublicLayout (Header/Footer 포함)

/admin/* 경로: AdminLayout (어드민 전용 UI)

이 방식으로 전역 공용 UI를 유지하면서 라우트만 교체할 수 있습니다.
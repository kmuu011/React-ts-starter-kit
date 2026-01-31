React 폴더 구조 지침서 (현재 구조 기준)
1) 최상위 규칙

features/ : "기능 단위(도메인/화면 단위)"로 분리한다.

shared/ : 여러 feature에서 공용으로 쓰는 것만 둔다. (UI, utils, types, 공용 hooks 등)

app/ : 앱 전역 설정 (router, config, providers, layouts)

assets/ : 정적 파일 (이미지, 폰트 등)

main.tsx, index.css : 엔트리만 둔다.

2) features 내부 기본 형태

각 feature는 아래 4개만 가진다.

features/<featureName>/
├── pages/        // 라우트 단위 페이지(화면)
├── components/   // 해당 feature 전용 컴포넌트
├── hooks/        // 해당 feature 전용 hooks
├── api/          // 해당 feature 전용 API 호출/쿼리
└── types         // 해당 feature 전용 타입


pages만 라우터에서 직접 import한다.

components/hooks/api는 페이지가 조합해서 쓴다.

3) role 라우팅(/admin, /seller, /member) 폴더 규칙

라우트는 “role → 하위 기능” 순서로 그대로 폴더로 만든다.

features/
├── admin/
│   └── gifticon/
│       └── template/
│           ├── pages/
│           ├── components/
│           ├── hooks/
│           └── api/
├── seller/
│   ├── myGifticonTemplate/
│   │   ├── pages/
│   │   └── ...
│   └── gifticon/
│       └── template/
│           └── ...
└── member/
    └── sellerGifticonTemplate/
        └── ...


규칙:

URL 보고 폴더 위치가 바로 떠올라야 한다.

같은 도메인(gifticon/template)이라도 role이 다르면 각 role 밑에 따로 둔다.

4) shared 규칙

shared/components : 진짜 공용 UI만 (Pagination, ToastMessage 등)

shared/hooks, shared/utils, shared/types : 전역 공용만

shared/store : 전역 상태 관리 (zustand 등)

shared/constants : 전역 상수 (httpStatus, routerPaths, sessionKeys 등)

shared/api : API 클라이언트 (axios 인스턴스, 공용 인터셉터 등)

특정 feature에서만 쓰는 건 shared로 올리지 않는다.

5) 파일 네이밍 규칙(최소 규칙)

pages/*Page.tsx : 라우트 화면

components/* : 재사용되는 화면 구성요소

api/* : fetch/axios, React Query queryFn 등 API만

hooks/use*.ts : 해당 feature 전용 훅
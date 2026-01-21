# 메모 시스템 API 가이드

프론트엔드 개발자를 위한 메모 API 문서입니다.

## 개요

메모 시스템은 **블록 기반 구조**로 설계되어 있습니다. 하나의 메모는 여러 개의 블록으로 구성되며, 각 블록은 텍스트, 체크리스트, 이미지, 비디오 등 다양한 타입을 가질 수 있습니다.

### 인증

모든 API는 `session-key` 헤더가 필요합니다.

```
Headers:
  session-key: {로그인 시 발급받은 세션 키}
```

---

## 데이터 구조

### Memo (메모)

| 필드 | 타입 | 설명 |
|------|------|------|
| idx | number | 메모 고유 ID |
| title | string \| null | 메모 제목 (선택) |
| pinned | boolean | 고정 여부 (기본값: false) |
| archived | boolean | 보관 여부 (기본값: false) |
| createdAt | string | 생성일시 (ISO 8601) |
| updatedAt | string | 수정일시 (ISO 8601) |
| blocks | MemoBlock[] | 블록 목록 |

### MemoBlock (메모 블록)

| 필드 | 타입 | 설명 |
|------|------|------|
| idx | number | 블록 고유 ID |
| orderIndex | number | 블록 순서 (0부터 시작) |
| type | string | 블록 타입: `TEXT`, `CHECKLIST`, `IMAGE`, `VIDEO` |
| content | string \| null | 텍스트 내용 (TEXT, CHECKLIST) |
| checked | boolean \| null | 체크 여부 (CHECKLIST만 사용) |
| fileIdx | number \| null | 파일 ID (IMAGE, VIDEO만 사용) |
| displayWidth | number \| null | 표시 너비 (IMAGE, VIDEO) |
| displayHeight | number \| null | 표시 높이 (IMAGE, VIDEO) |
| videoDurationMs | number \| null | 비디오 길이 ms (VIDEO만 사용) |

### 블록 타입별 필수/선택 필드

| 타입 | content | checked | fileIdx | displayWidth/Height | videoDurationMs |
|------|---------|---------|---------|---------------------|-----------------|
| TEXT | ✅ 필수 | - | - | - | - |
| CHECKLIST | ✅ 필수 | ✅ 필수 | - | - | - |
| IMAGE | - | - | ✅ 필수 | 선택 | - |
| VIDEO | - | - | ✅ 필수 | 선택 | 선택 |

---

## API 엔드포인트

### 1. 메모 목록 조회

```
GET /api/memo
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | ✅ | 페이지 번호 (1부터 시작) |
| count | number | ✅ | 페이지당 개수 |
| search | string | - | 검색어 (블록 content에서 검색) |
| archived | string | - | `0`: 일반 메모만, `1`: 보관된 메모만, 미입력: 전체 |

**Response:**

```json
{
  "itemList": [
    {
      "idx": 1,
      "title": "오늘 할 일",
      "pinned": true,
      "archived": false,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "blocks": [
        {
          "idx": 1,
          "orderIndex": 0,
          "type": "TEXT",
          "content": "프로젝트 관련 메모",
          "checked": null,
          "fileIdx": null,
          "displayWidth": null,
          "displayHeight": null,
          "videoDurationMs": null
        }
      ]
    }
  ],
  "page": 1,
  "count": 10,
  "totalCount": 25
}
```

**정렬:**
- `pinned: true`인 메모가 상단에 표시
- 같은 pinned 상태 내에서는 최신순 (idx 내림차순)

---

### 2. 메모 단건 조회

```
GET /api/memo/:memoIdx
```

**Response:**

```json
{
  "idx": 1,
  "title": "오늘 할 일",
  "pinned": false,
  "archived": false,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "blocks": [
    {
      "idx": 1,
      "orderIndex": 0,
      "type": "TEXT",
      "content": "첫 번째 텍스트"
    },
    {
      "idx": 2,
      "orderIndex": 1,
      "type": "CHECKLIST",
      "content": "회의 참석",
      "checked": false
    }
  ]
}
```

---

### 3. 메모 생성

```
POST /api/memo
```

**Request Body:**

```json
{
  "title": "새 메모",
  "pinned": false,
  "archived": false,
  "blocks": [
    {
      "orderIndex": 0,
      "type": "TEXT",
      "content": "메모 내용입니다."
    }
  ]
}
```

**Response:** 생성된 메모 객체 반환 (blocks 포함)

---

### 4. 메모 수정

```
PATCH /api/memo/:memoIdx
```

**Request Body:**

```json
{
  "title": "수정된 제목",
  "pinned": true,
  "blocks": [
    {
      "orderIndex": 0,
      "type": "TEXT",
      "content": "수정된 내용"
    },
    {
      "orderIndex": 1,
      "type": "CHECKLIST",
      "content": "새로운 할 일",
      "checked": false
    }
  ]
}
```

**Response:**

```json
{
  "result": true
}
```

> ⚠️ **주의:** 수정 시 기존 블록은 모두 삭제되고 새로운 블록으로 교체됩니다. 부분 수정이 아닌 전체 교체 방식입니다.

---

### 5. 메모 삭제

```
DELETE /api/memo/:memoIdx
```

**Response:**

```json
{
  "result": true
}
```

> ℹ️ 메모 삭제 시 연결된 파일(이미지, 비디오)도 함께 삭제됩니다.

---

## 파일 API (이미지/비디오용)

메모에 이미지나 비디오를 첨부하려면 먼저 파일을 업로드해야 합니다.

### 1. 파일 업로드

```
POST /api/file/upload
Content-Type: multipart/form-data
```

**Request:**

```
files: [파일1, 파일2, ...]  (form-data)
```

**Response:**

```json
[
  {
    "idx": 123,
    "fileKey": "files/2024/01/15/abc123.jpg",
    "fileName": "screenshot",
    "fileType": "jpg",
    "fileMimeType": "image/jpeg",
    "fileSize": "1024000",
    "createdAt": "2024-01-15T09:00:00.000Z"
  }
]
```

### 2. 파일 다운로드

```
POST /api/file/:fileIdx/download
```

파일 바이너리 데이터가 반환됩니다.

### 3. 파일 삭제

```
DELETE /api/file/:fileIdx
```

> ⚠️ 메모에서 사용 중인 파일은 삭제할 수 없습니다. 먼저 메모에서 해당 블록을 제거해야 합니다.

---

## 사용 예시

### 텍스트만 있는 메모

```json
{
  "title": "간단한 메모",
  "blocks": [
    {
      "orderIndex": 0,
      "type": "TEXT",
      "content": "오늘 회의 내용 정리"
    }
  ]
}
```

### 체크리스트 메모

```json
{
  "title": "오늘 할 일",
  "blocks": [
    {
      "orderIndex": 0,
      "type": "TEXT",
      "content": "할 일 목록"
    },
    {
      "orderIndex": 1,
      "type": "CHECKLIST",
      "content": "이메일 확인",
      "checked": true
    },
    {
      "orderIndex": 2,
      "type": "CHECKLIST",
      "content": "보고서 작성",
      "checked": false
    },
    {
      "orderIndex": 3,
      "type": "CHECKLIST",
      "content": "회의 참석",
      "checked": false
    }
  ]
}
```

### 이미지가 포함된 메모

```json
{
  "title": "스크린샷 메모",
  "blocks": [
    {
      "orderIndex": 0,
      "type": "TEXT",
      "content": "버그 스크린샷"
    },
    {
      "orderIndex": 1,
      "type": "IMAGE",
      "fileIdx": 123,
      "displayWidth": 800,
      "displayHeight": 600
    },
    {
      "orderIndex": 2,
      "type": "TEXT",
      "content": "위 이미지에서 에러 발생"
    }
  ]
}
```

### 비디오가 포함된 메모

```json
{
  "blocks": [
    {
      "orderIndex": 0,
      "type": "VIDEO",
      "fileIdx": 456,
      "displayWidth": 1280,
      "displayHeight": 720,
      "videoDurationMs": 30000
    }
  ]
}
```

---

## 에러 응답

### 공통 에러 형식

```json
{
  "statusCode": 400,
  "error": "error_code",
  "message": "에러 메시지"
}
```

### 주요 에러 코드

| HTTP Status | error | 설명 |
|-------------|-------|------|
| 400 | not_exist_memo | 존재하지 않는 메모 |
| 400 | not_exist_file | 존재하지 않는 파일 |
| 400 | in_use_file | 메모에서 사용 중인 파일 (삭제 불가) |
| 401 | unauthorized | 로그인 필요 |

---

## FE 구현 가이드

### 1. 메모 에디터 구현

블록 기반 에디터 구현 시 고려사항:

- 각 블록은 독립적인 컴포넌트로 구현
- 드래그 앤 드롭으로 블록 순서 변경 시 `orderIndex` 재계산 필요
- 저장 시 모든 블록의 `orderIndex`를 0부터 순차적으로 설정

### 2. 이미지/비디오 업로드 플로우

```
1. 사용자가 이미지/비디오 선택
2. POST /api/file/upload 호출
3. 응답에서 fileIdx 획득
4. 해당 fileIdx로 IMAGE/VIDEO 블록 생성
5. 메모 저장
```

### 3. 메모 목록 화면

- `archived=0`으로 일반 메모 조회
- 별도 보관함 화면에서는 `archived=1`로 조회
- pinned 메모는 시각적으로 구분 (핀 아이콘 등)

### 4. 검색 기능

- `search` 파라미터는 블록의 `content` 필드에서 검색
- 공백으로 구분된 여러 키워드는 AND 조건으로 검색

---

## TypeScript 타입 정의

```typescript
// 블록 타입
type BlockType = 'TEXT' | 'CHECKLIST' | 'IMAGE' | 'VIDEO';

// 메모 블록
interface MemoBlock {
  idx?: number;
  orderIndex: number;
  type: BlockType;
  content?: string;
  checked?: boolean;
  fileIdx?: number;
  displayWidth?: number;
  displayHeight?: number;
  videoDurationMs?: number;
}

// 메모
interface Memo {
  idx: number;
  title?: string;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  blocks: MemoBlock[];
}

// 메모 생성/수정 DTO
interface SaveMemoDto {
  title?: string;
  pinned?: boolean;
  archived?: boolean;
  blocks: Omit<MemoBlock, 'idx'>[];
}

// 목록 응답
interface MemoListResponse {
  itemList: Memo[];
  page: number;
  count: number;
  totalCount: number;
}

// 파일
interface FileInfo {
  idx: number;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileSize: string;
  createdAt: string;
}
```

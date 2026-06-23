# 도서관리시스템 API 정의서

> AI 미니프로젝트 5차 — 도서관리시스템 백엔드
> 4차 React 프론트엔드(`../my-app`)의 `fetch` 호출 패턴에 맞춰 설계

---

## 기본 정보

| 항목 | 값 |
|---|---|
| API 이름 | Book Management API |
| 버전 | v1 |
| 기본 URL | `http://localhost:8080` |
| 인증 | 없음 (학습용) |
| 데이터 형식 | `application/json` |
| 문자 인코딩 | UTF-8 |

## 공통 에러 응답

| 상태 코드 | 의미 | 발생 케이스 |
|---|---|---|
| `400 Bad Request` | 요청 형식/검증 실패 | 필수 필드 누락, 타입 오류 |
| `404 Not Found` | 리소스 없음 | 존재하지 않는 도서 id 조회/수정/삭제 |
| `500 Internal Server Error` | 서버 내부 오류 | 예상치 못한 예외 (3일차 GlobalExceptionHandler에서 정제 예정) |

에러 응답 본문 (3일차에 통일 예정):
```json
{
  "timestamp": "2026-06-09T10:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "도서를 찾을 수 없습니다. id=999"
}
```

---

## Book 객체 스키마

```json
{
  "id": 1,                                    // Long, 자동 생성
  "title": "별빛 아래의 서점",                  // String, 필수, 1~200자
  "author": "홍길동",                          // String, 필수, 1~100자
  "category": "소설",                         // String, 선택, 최대 50자
  "content": "작은 마을의 오래된 서점...",      // String(TEXT), 선택
  "coverImageUrl": "",                        // String(TEXT), 빈 문자열 가능 (Data URL)
  "createdAt": "2026-06-09T10:00:00",         // LocalDateTime, 서버 자동
  "updatedAt": "2026-06-09T10:05:00"          // LocalDateTime, 서버 자동
}
```

---

## 1. 전체 도서 목록 조회

```
GET /books
```

**설명**: 등록된 모든 도서를 조회한다. 목록 페이지 진입 시 호출.

**요청**: 본문 없음, 쿼리 파라미터 없음

**응답 — 200 OK**
```json
[
  {
    "id": 1,
    "title": "별빛 아래의 서점",
    "author": "홍길동",
    "category": "소설",
    "content": "작은 마을의 오래된 서점에서 펼쳐지는 이야기.",
    "coverImageUrl": "",
    "createdAt": "2026-06-09T09:00:00",
    "updatedAt": "2026-06-09T09:00:00"
  },
  {
    "id": 2,
    "title": "데이터로 세상을 읽다",
    "author": "김데이터",
    "category": "자기계발",
    ...
  }
]
```

**Frontend 호출 예시** (`my-app/src/api/books.js`)
```js
const res = await fetch('http://localhost:8080/books');
const books = await res.json();
```

---

## 2. 도서 상세 조회

```
GET /books/{id}
```

**설명**: 단일 도서의 전체 정보를 조회한다. 상세 페이지 진입 / 수정 페이지 진입 시 호출.

**요청**
| 위치 | 이름 | 타입 | 설명 |
|---|---|---|---|
| Path | `id` | Long | 도서 id |

**응답 — 200 OK**
```json
{
  "id": 1,
  "title": "별빛 아래의 서점",
  "author": "홍길동",
  "category": "소설",
  "content": "작은 마을의 오래된 서점...",
  "coverImageUrl": "",
  "createdAt": "2026-06-09T09:00:00",
  "updatedAt": "2026-06-09T09:00:00"
}
```

**응답 — 404 Not Found**
- 존재하지 않는 `id` 조회 시

---

## 3. 도서 등록

```
POST /books
```

**설명**: 새 도서를 등록한다. id, createdAt, updatedAt은 서버가 자동 부여하므로 요청 본문에서 제외한다.

**요청**
```json
{
  "title": "느린 산책",            // 필수, 1~200자
  "author": "박에세이",           // 필수, 1~100자
  "category": "에세이",          // 선택
  "content": "바쁜 일상 속에서...", // 선택
  "coverImageUrl": ""             // 선택 (보통 빈 문자열)
}
```

**응답 — 201 Created**
```json
{
  "id": 6,
  "title": "느린 산책",
  "author": "박에세이",
  "category": "에세이",
  "content": "바쁜 일상 속에서...",
  "coverImageUrl": "",
  "createdAt": "2026-06-09T10:10:00",
  "updatedAt": "2026-06-09T10:10:00"
}
```

**에러**
- `400 Bad Request`: `title` 또는 `author`가 비어있거나 길이 초과

---

## 4. 도서 부분 수정

```
PATCH /books/{id}
```

**설명**: 도서의 일부 필드만 수정한다. 보낸 필드만 반영되고, 누락된 필드는 기존 값 유지. `updatedAt`은 서버가 자동 갱신.

**요청 (예: 제목과 카테고리만 수정)**
```json
{
  "title": "느린 산책 (개정판)",
  "category": "에세이/자기계발"
}
```

**응답 — 200 OK**
```json
{
  "id": 6,
  "title": "느린 산책 (개정판)",
  "author": "박에세이",
  "category": "에세이/자기계발",
  "content": "바쁜 일상 속에서...",
  "coverImageUrl": "",
  "createdAt": "2026-06-09T10:10:00",
  "updatedAt": "2026-06-09T10:20:00"
}
```

**에러**
- `404 Not Found`: 존재하지 않는 `id`
- `400 Bad Request`: 보낸 필드의 타입/길이가 잘못된 경우

---

## 5. 도서 삭제

```
DELETE /books/{id}
```

**설명**: 도서를 삭제한다.

**요청**: 본문 없음

**응답 — 204 No Content**
- 본문 없음

**에러**
- `404 Not Found`: 존재하지 않는 `id` (3일차 예외 처리 적용 후)

---

## 6. AI 표지 URL 저장 (4일차 추가 예정)

```
PATCH /books/{id}/cover
```

**설명**: Frontend가 OpenAI를 직접 호출해 받은 base64 이미지를 Data URL로 변환한 뒤, 서버에 저장 요청한다. 백엔드는 단순히 `coverImageUrl` 필드만 갱신.

**요청**
```json
{
  "coverImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**응답 — 200 OK**
```json
{
  "id": 6,
  "title": "느린 산책",
  ...
  "coverImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "updatedAt": "2026-06-09T10:30:00"
}
```

**에러**
- `404 Not Found`: 존재하지 않는 `id`
- `400 Bad Request`: `coverImageUrl` 누락

---

## 엔드포인트 요약표

| # | 메서드 | URL | 설명 | 성공 | 에러 |
|---|---|---|---|---|---|
| 1 | GET | `/books` | 목록 조회 | 200 | - |
| 2 | GET | `/books/{id}` | 상세 조회 | 200 | 404 |
| 3 | POST | `/books` | 등록 | 201 | 400 |
| 4 | PATCH | `/books/{id}` | 부분 수정 | 200 | 400, 404 |
| 5 | DELETE | `/books/{id}` | 삭제 | 204 | 404 |
| 6 | PATCH | `/books/{id}/cover` | AI 표지 저장 (4일차) | 200 | 400, 404 |

---

## CORS

`backend/.../config/WebConfig.java` 에서 다음 Origin을 허용:
- `http://localhost:5173` (Vite 개발 서버)
- `http://localhost:3000` (기존 json-server 호환)

허용 메서드: `GET, POST, PUT, PATCH, DELETE, OPTIONS`

---

## 변경 이력

| 일자 | 내용 |
|---|---|
| 2026-06-09 | 초안 작성 (1일차 미션 1) |

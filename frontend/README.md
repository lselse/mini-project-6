# 도서관리시스템

> KT AIVLE School 4차 미니프로젝트 — AI 도서 표지 생성 서비스

별도 백엔드 없이 React SPA가 `json-server`(Mock API)와 OpenAI Images API를 직접 호출하여 도서를 관리하는 시스템. 도서 등록 시 입력한 제목·내용을 프롬프트로 AI 표지를 생성한다.

<img width="1470" height="1374" alt="image" src="https://github.com/user-attachments/assets/98edc3dd-62e2-4294-96b1-69507c6272b1" />


---

## 조 정보

- **조 이름**: AI 23조
- **팀원**:
  - 편진솔 — PM·기획
  - 유정환 — UI·레이아웃·스타일링·QA
  - 이제혁 — CRUD 연동
  - 이소은 — OpenAI 연동
  - 김주형 — 발표·문서

---

## 미션 개요

| 일자 | 단계 | 핵심 작업 | 상태 |
|---|---|---|---|
| 1일차 | M1·M2 | 기획·설계, Vite 프로젝트 세팅, Mock UI | 완료 |
| 2일차 | M3·M4 | json-server CRUD 연동, 폼 유효성, 검색·필터, 카테고리 | 완료 |
| 3일차 | M5·M6 | OpenAI 표지 생성, 스타일 선택, 레이아웃 개선 | 완료 |

### 최종 산출물 (3일차 제출)
- `AI_23조.zip` — 전체 소스 코드 (`node_modules/` 제외)
- `AI_23조.pptx` — 발표 자료
- `README.md` — 본 문서

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React 19 + Vite |
| 라우팅 | react-router-dom v7 |
| Mock 백엔드 | json-server v0.17.4 |
| AI | OpenAI Images API (`gpt-image-2`) |
| 상태 관리 | useState + useEffect (외부 라이브러리 X) |
| HTTP | 브라우저 fetch API (axios X) |
| 스타일링 | 일반 CSS (Tailwind/CSS Modules X) |

---

## 진행 상황

### 1일차 (M1·M2)
- [x] **M1: 기획·설계** — 데이터 모델, API 명세, 폴더 구조, UI 스케치
- [x] Vite + React 프로젝트 생성 (`my-app/`)
- [x] `react-router-dom` 설치 및 라우팅 구성
- [x] 4개 페이지 Mock UI 작성 (목록 / 상세 / 등록 / 수정)
- [x] 공통 헤더 컴포넌트 (`Header.jsx`)
- [x] `db.json` 시드 데이터
- [x] 전체 스타일 (`App.css`)
- [x] `.gitignore` 설정

### 2일차 (M3·M4)
- [x] **`src/api/books.js`** — fetch 기반 CRUD 함수 5개 (`getBooks`, `getBook`, `createBook`, `updateBook`, `deleteBook`)
- [x] **목록 페이지** — `useEffect` + `getBooks()` 연동
- [x] **상세 페이지** — `useParams` + `getBook(id)` 연동
- [x] **등록 페이지** — `createBook()` (POST) 연동
- [x] **수정 페이지** — `getBook(id)` + `updateBook(id, patch)` (PATCH) 연동
- [x] **삭제 기능** — `deleteBook(id)` (DELETE) + `window.confirm`
- [x] **로딩 · 에러 · 빈 목록 상태 처리** (try-catch)
- [x] **[심화] 폼 유효성 검사** — 필수 입력 + 길이 제한 + 인라인 에러 메시지
- [x] **[심화] 검색 · 필터 UI** — 제목·작가 검색 (Array.filter 활용)
- [x] **[추가 기능] 카테고리** — 등록·수정 폼에서 9종 카테고리 선택, 목록 필터 + 카드 배지, 상세 페이지 배지
- [x] **[추가 기능] 홈 화면** — `/` 경로에 별도 홈페이지 추가

### 3일차 (M5·M6)
- [x] `src/api/openai.js` — OpenAI Images API 호출 함수 연동 완료
- [x] AI 표지 생성 → `b64_json` → Data URL → PATCH 저장 완료
- [x] 퀄리티 토글 (LOW / MEDIUM / HIGH) 및 에러 처리 적용
- [x] **[추가 기능] AI 표지 스타일 선택** — 기본, 수채화, 일러스트, 3D, 실사 등 5가지 화풍 지원
- [x] **[추가 기능] 표지 삭제 기능** — 생성된/저장된 표지 이미지 삭제 및 재확인(confirm) 기능
- [x] **[추가 기능] 도서 목록 뷰 모드** — Grid(바둑판) / List(리스트) 형태 토글 버튼 적용
- [x] **[UI 개선] 레이아웃 및 디자인 고도화**
  - 상세 페이지 및 폼 레이아웃에 외곽 테두리(카드 형태) 추가
  - 전체적인 배경색 및 버튼, 테마 색상을 더 연하고 부드러운 파스텔톤으로 조정
- [x] API Key 입력 UI (state로만 관리, 저장 X)
- [x] 발표 자료(PPT) 정리

---

## 실행 방법

### 첫 세팅 (한 번만)
```bash
cd my-app
npm install
```

### 개발 서버 (터미널 2개)

```bash
# 터미널 1 — json-server (Mock API)
cd my-app
npx json-server@0.17.4 --watch db.json --port 3000
# 확인: http://localhost:3000/books
```

```bash
# 터미널 2 — Vite (React)
cd my-app
npm run dev
# 확인: http://localhost:5173
```

### 빌드
```bash
npm run build       # 결과물: dist/
npm run preview     # 빌드 결과 미리보기
```

---

## 라우팅

| 경로 | 컴포넌트 | 용도 |
|---|---|---|
| `/` | `HomePage` | 홈 화면 |
| `/books` | `BookListPage` | 도서 목록 (검색·카테고리 필터) |
| `/books/:id` | `BookDetailPage` | 도서 상세 |
| `/books/new` | `BookCreatePage` | 신규 등록 |
| `/books/:id/edit` | `BookEditPage` | 수정 |

---

## 데이터 모델

### Book 객체

```js
{
  id: 1,                                    // number (json-server 자동 증가)
  title: '아몬드',                          // string, 필수, 최대 50자
  author: '손원평',                         // string, 필수, 최대 20자
  category: '소설',                         // string, 필수, 9종 카테고리 중 선택
  content: '...',                           // string, 필수, 최소 10자, AI 프롬프트 활용
  coverImageUrl: '',                        // string, 빈 값 가능, AI 생성 시 Data URL
  createdAt: '2026-04-02T09:30:00.000Z',    // ISO 8601
  updatedAt: '2026-04-02T09:30:00.000Z'     // ISO 8601
}
```

### 카테고리 (9종)
`소설`, `에세이`, `자기계발`, `인문`, `경제경영`, `과학`, `역사`, `어린이/청소년`, `기타`

---

## API 엔드포인트

### json-server (`http://localhost:3000`)

| 메서드 | URL | 용도 |
|---|---|---|
| GET | `/books` | 목록 조회 |
| GET | `/books/:id` | 상세 조회 |
| POST | `/books` | 신규 등록 |
| PATCH | `/books/:id` | 부분 수정 |
| DELETE | `/books/:id` | 삭제 |

### OpenAI Images API (3일차)

```
POST https://api.openai.com/v1/images/generations
Authorization: Bearer {userApiKey}
Content-Type: application/json
```

응답 `data[0].b64_json` → Data URL 변환 → `PATCH /books/:id`로 저장.

---

## 폴더 구조

```
my-app/
├── db.json                       # json-server 시드 데이터 (11권)
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx                   # 라우팅 설정
    ├── App.css                   # 전체 스타일
    ├── index.css
    ├── constants.js              # 카테고리 등 상수
    ├── api/
    │   ├── books.js              # json-server CRUD 함수
    │   └── openai.js             # OpenAI 호출 함수
    ├── components/
    │   └── Header.jsx
    └── pages/
        ├── HomePage.jsx          # 홈 화면 (/)
        ├── BookListPage.jsx      # 도서 목록 (/books)
        ├── BookDetailPage.jsx    # 도서 상세
        ├── BookCreatePage.jsx    # 신규 등록
        └── BookEditPage.jsx      # 수정
```

---

## 주요 기능 상세

### 검색 · 필터 (목록 페이지)
- **검색**: 제목 · 작가 대상 (대소문자 무관, `Array.filter`)
- **카테고리 필터**: 9종 카테고리 + 전체
- **뷰 토글(View Toggle)**: 우측 상단 버튼을 통해 바둑판(Grid) 형태와 리스트(List) 형태 전환 가능

### 폼 유효성 검사 (등록 · 수정)
- 제목: 필수, 최대 50자
- 작가: 필수, 최대 20자
- 내용: 필수, 최소 10자
- 카테고리: 필수 (드롭다운)
- 입력 시작 시 해당 필드 에러 메시지 자동 해제
- 인라인 빨간 에러 메시지 + `.input-error` 테두리 강조

### AI 표지 생성 및 관리
- **프롬프트 자동 구성**: 입력한 '제목', '저자', '카테고리', '내용', '선택한 화풍(Style)'을 조합해 영문 프롬프트 자동 생성
- **다양한 스타일 지원**: 수채화, 일러스트, 3D, 실사 등 원하는 느낌의 표지 선택 가능
- **동적 UI**: 현재 표지 존재 여부에 따라 "생성하기"와 "재생성하기" 버튼 텍스트 변경
- **표지 삭제**: 기존 표지를 제거하고 빈 상태로 폼을 저장하는 기능 추가

### 상태별 UI 처리
- 로딩 중: "불러오는 중..." 표시
- 에러: 빨간 박스 + json-server 안내
- 빈 목록 / 검색 결과 없음: 안내 메시지

---

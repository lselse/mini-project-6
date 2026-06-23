# 도서관리시스템 — AI 표지 자동 생성

> KT AIVLE School AI 트랙 · 미니프로젝트 5차
> "걷기가 서재 — 작가의 산책" · AI가 책 표지를 자동 생성하는 도서 관리 시스템

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![Java](https://img.shields.io/badge/Java-17-orange)](https://openjdk.org)

> 4차에서 개발한 React 프론트엔드(`frontend/`)의 json-server를 Spring Boot + JPA + H2로 대체하고,
> AI 표지 저장 API와 BCrypt·토큰 기반 회원 인증까지 확장한다.

---

## 1일차 산출물 (미션 1·2)

### 미션 1 — 기획/설계

#### Frontend 호출 패턴 분석
`frontend/src/api/books.js` 에서 추출:

| 함수 | 메서드 | URL | 본문 |
|---|---|---|---|
| `getBooks` | GET | `/books` | - |
| `getBook(id)` | GET | `/books/:id` | - |
| `createBook(book)` | POST | `/books` | `{title, author, content, category, coverImageUrl, createdAt, updatedAt}` |
| `updateBook(id, patch)` | PATCH | `/books/:id` | 변경 필드 + `updatedAt` |
| `deleteBook(id)` | DELETE | `/books/:id` | - |

추가로 `frontend/src/api/openai.js` 에서 AI 표지 생성 결과는 `coverImageUrl`로 PATCH 저장됨.

#### ERD — Book 엔티티

개념 ERD(Chen 표기법) + 논리 ERD(Crow's Foot, IE 표기법) + 테이블 명세서는 **[backend/ERD.md](backend/ERD.md)** 참고.

요약:
| 컬럼 | 타입 | NULL | 키 |
|---|---|---|---|
| `id` | BIGINT | NOT NULL | PK (AUTO_INCREMENT) |
| `title` | VARCHAR(200) | NOT NULL | - |
| `author` | VARCHAR(100) | NOT NULL | - |
| `category` | VARCHAR(50) | NULL | - |
| `content` | TEXT | NULL | - |
| `cover_image_url` | TEXT | NULL | - |
| `owner_username` | VARCHAR(50) | NULL | - (등록한 사용자, 토큰 기반) |
| `created_at` | DATETIME | NOT NULL | - |
| `updated_at` | DATETIME | NOT NULL | - |

#### API 정의서

요약표는 아래와 같다. 엔드포인트별 상세 요청/응답/에러 케이스는 **[backend/API.md](backend/API.md)** 참고.

| # | 메서드 | URL | 설명 | 인증 | 성공 | 에러 |
|---|---|---|---|---|---|---|
| 1 | GET | `/books` | 목록 조회 | - | 200 | - |
| 2 | GET | `/books/{id}` | 상세 조회 | - | 200 | 404 |
| 3 | POST | `/books` | 등록 | ✅ | 200 | 400, 401 |
| 4 | PATCH | `/books/{id}` | 부분 수정 | ✅ | 200 | 400, 401, 404 |
| 5 | DELETE | `/books/{id}` | 삭제 | ✅ | 200 | 401, 404 |
| 6 | PATCH | `/books/{id}/cover` | AI 표지 저장 | ✅ | 200 | 401, 404 |
| 7 | POST | `/auth/signup` | 회원가입 | - | 201 | 401* |
| 8 | POST | `/auth/login` | 로그인 (토큰 발급) | - | 200 | 401 |
| 9 | POST | `/auth/logout` | 로그아웃 (토큰 무효화) | - | 204 | - |
| 10 | GET | `/auth/me` | 내 정보 조회 (가입일 등) | ✅ | 200 | 401 |
| 11 | PATCH | `/auth/password` | 비밀번호 변경 | ✅ | 200 | 401 |
| 12 | DELETE | `/auth` | 회원 탈퇴 | ✅ | 204 | 401 |

> 인증(✅)이 필요한 요청은 `Authorization: Bearer {token}` 헤더 필수. GET·`/auth/{signup,login,logout}`은 면제.
> *회원가입의 401은 아이디 중복/입력 누락 시 `AuthException`으로 처리됨.
> `/auth/**`는 인터셉터 면제 경로라 me·password·탈퇴는 컨트롤러에서 토큰을 직접 검증한다.

---

### 미션 2 — 환경설정 + 모든 계층 골격 작성

#### 기술 스택
- Java 17 / Spring Boot 4.0.6
- Spring Web (MVC), Spring Data JPA, Validation, Lombok, DevTools
- Spring Security Crypto (BCrypt 비밀번호 해시)
- H2 (in-memory)
- Gradle Wrapper
- Frontend: React 19, Vite, Fetch API, React Context (인증 상태)

#### 폴더 구조
```
4차/
├── README.md                          # ← 통합 문서 (이 파일)
├── backend/                           # Spring Boot 백엔드
│   ├── API.md                         # API 상세 정의서
│   ├── ERD.md                         # ERD (Mermaid + 명세서)
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradlew, gradlew.bat
│   ├── gradle/wrapper/
│   └── src/main/
│       ├── java/com/aivle/bookapp/
│       │   ├── BookappApplication.java
│       │   ├── config/
│       │   │   ├── WebConfig.java              # CORS + 인터셉터 등록
│       │   │   └── AuthInterceptor.java        # 토큰 인증 (POST/PATCH/DELETE)
│       │   ├── controller/
│       │   │   ├── BookController.java         # 도서 REST API (표지 저장 포함 6종)
│       │   │   └── AuthController.java         # 회원가입/로그인/로그아웃/내정보/비번/탈퇴
│       │   ├── service/
│       │   │   ├── BookService.java            # 도서 비즈니스 로직
│       │   │   └── AuthService.java            # 인증 + BCrypt + 토큰 + 비번변경/탈퇴
│       │   ├── repository/
│       │   │   ├── BookRepository.java         # JpaRepository<Book>
│       │   │   └── UserRepository.java         # JpaRepository<User>
│       │   ├── exception/
│       │   │   ├── BookNotFoundException.java   # 404
│       │   │   ├── AuthException.java           # 401
│       │   │   └── GlobalExceptionHandler.java  # @RestControllerAdvice
│       │   └── domain/
│       │       ├── Book.java                   # 도서 Entity (ownerUsername 포함)
│       │       └── User.java                   # 사용자 Entity
│       └── resources/
│           ├── application.yaml
│           └── data.sql                       # 시드 8권
└── frontend/                          # React 프론트엔드 (4차 통합)
    └── src/
        ├── pages/                     # BookList, BookDetail, BookCreate, BookEdit, Home, Login, Signup, MyPage
        ├── api/                       # books.js, openai.js, auth.js, favorites.js
        ├── context/AuthContext.jsx    # 전역 로그인 상태
        └── components/Header.jsx      # 로그인 상태별 네비게이션 + 마이페이지
```

#### CORS 정책 (`WebConfig.java`)
- 허용 Origin: `http://localhost:5173` (Vite), `http://localhost:3000` (json-server 잔재)
- 허용 메서드: `GET, POST, PATCH, DELETE, OPTIONS`
- 허용 헤더: `*` (`Authorization` 포함)

---

## 2일차 산출물 (미션 3·4)

### 미션 3 — Repository + Service + GET 2종 + Frontend 1차 연동

#### [Repository] `BookRepository.java`
`JpaRepository<Book, Long>` 인터페이스만 상속받아 한 줄로 정의. Spring Data JPA가 `findAll`, `findById`, `save`, `deleteById` 등 기본 CRUD 메서드를 자동 제공.

```java
public interface BookRepository extends JpaRepository<Book, Long> {
}
```

**H2 콘솔 동작 검증**: `http://localhost:8080/h2-console` 접속 → JDBC URL `jdbc:h2:mem:testdb`, User `sa` (비번 없음) → `SELECT * FROM books;` 로 시드 5권 확인.

#### [Service] `BookService` — 조회 2종
- 생성자 주입: `@RequiredArgsConstructor` + `private final BookRepository`
- `findAllBooks()`: 전체 도서 목록
- `findBookById(Long id)`: 단일 도서 상세 (없으면 `BookNotFoundException` → 3일차에 사용자 정의 예외로 교체 완료)

```java
@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    public Book findBookById(Long id) {
        return bookRepository.findById(id)
            .orElseThrow(() -> new BookNotFoundException(id));
    }
}
```

#### [Controller] `BookController` — GET 2종
- `GET /books` → 목록 조회
- `GET /books/{id}` → 상세 조회

```java
@GetMapping
public List<Book> getBooks() {
    return bookService.findAllBooks();
}

@GetMapping("/{id}")
public Book getBook(@PathVariable Long id) {
    return bookService.findBookById(id);
}
```

#### [통합] Frontend 1차 연동
`frontend/src/api/books.js` 의 `BASE_URL` 한 줄 변경:
```js
const BASE_URL = 'http://localhost:8080/books'; // 기존: 3000 (json-server)
```

**Postman 테스트 시나리오**:
| Method | URL | 기대 결과 |
|---|---|---|
| GET | `/books` | 200 OK + 시드 5권 JSON |
| GET | `/books/1` | 200 OK + 1번 도서 |
| GET | `/books/999` | 500 (3일차에 404로 정제 예정) |

---

### 미션 4 — POST / PATCH / DELETE + 검증

#### [Domain] Book Entity 입력 검증 어노테이션
`title`과 `author`에 `@NotBlank` + `@Size` 적용. Controller의 `@Valid`와 함께 작동.
```java
@NotBlank(message = "제목은 필수입니다.")
@Size(max = 200, message = "제목은 200자 이하여야 합니다.")
@Column(nullable = false)
private String title;

@NotBlank(message = "저자는 필수입니다.")
@Size(max = 100, message = "저자명은 100자 이하여야 합니다.")
@Column(nullable = false)
private String author;
```
> `@Column(nullable = false)`는 DB 레벨 제약, `@NotBlank`/`@Size`는 요청 본문 검증. 둘은 별개라 같이 두는 게 일반적.

#### [Service] 등록 / 부분 수정 / 삭제 메서드
```java
// 3. 신규 도서 등록
public Book createBook(Book book) {
    return bookRepository.save(book);
}

// 4. 도서 정보 수정 (부분 수정 - PATCH)
public Book updateBook(Long id, Book patchBook) {
    Book existingBook = findBookById(id);
    if (patchBook.getTitle() != null) existingBook.setTitle(patchBook.getTitle());
    if (patchBook.getAuthor() != null) existingBook.setAuthor(patchBook.getAuthor());
    if (patchBook.getContent() != null) existingBook.setContent(patchBook.getContent());
    if (patchBook.getCategory() != null) existingBook.setCategory(patchBook.getCategory());
    return bookRepository.save(existingBook);
}

// 5. 도서 삭제
public void deleteBook(Long id) {
    bookRepository.deleteById(id);
}
```

**PATCH 부분 수정의 핵심**: 요청 본문에서 받은 `patchBook` 중 `null이 아닌 필드만` 기존 객체에 반영. 따라서 Frontend가 `{title: "수정"}`만 보내도 author/content는 기존 값 유지.

#### [Controller] POST + 검증 / PATCH / DELETE
```java
// 3. 신규 도서 등록 (POST)
@PostMapping
public Book createBook(@Valid @RequestBody Book book) {
    return bookService.createBook(book);
}

// 4. 도서 정보 수정 (PATCH)
@PatchMapping("/{id}")
public Book updateBook(@PathVariable Long id, @RequestBody Book patchBook) {
    return bookService.updateBook(id, patchBook);
}

// 5. 도서 삭제 (DELETE)
@DeleteMapping("/{id}")
public void deleteBook(@PathVariable Long id) {
    bookService.deleteBook(id);
}
```
- POST에 `@Valid` 적용 → Entity의 검증 어노테이션이 작동 → 400 Bad Request 자동 응답
- PATCH는 `@PatchMapping` 사용 (`@PutMapping`이 아님 — Frontend가 PATCH로 호출)

#### [통합] 풀스택 CRUD 동작 확인

**Postman 테스트 시나리오**:
| Method | URL | Body 예시 | 기대 결과 |
|---|---|---|---|
| POST | `/books` | `{title:"새 책", author:"홍길동"}` | 200 OK + id 자동 부여 |
| POST | `/books` | `{}` (title 누락) | 400 Bad Request (`@NotBlank` 작동) |
| PATCH | `/books/1` | `{title:"수정"}` | 200 OK + title만 갱신 |
| DELETE | `/books/1` | - | 200 OK |

**React 화면 동작**:
- 메인 → 도서 목록 → 카드 클릭 → 상세 페이지 (GET)
- `+ 신규 등록` → 폼 입력 → 저장 (POST)
- 상세 → `수정` → 폼 수정 → 저장 (PATCH)
- 상세 → `삭제` → 확인 → 목록에서 제거 (DELETE)

#### 한글 인코딩 이슈 해결
H2 콘솔과 `data.sql` 시드 데이터의 한글이 깨지는 문제 발생 → `application.yaml`에 인코딩 명시:
```yaml
spring:
  sql:
    init:
      mode: always
      encoding: UTF-8       # Windows에서 한글 깨짐 방지
```

---

## 3일차 산출물 (미션 5·6)

### 미션 5 — 사용자 정의 예외 + `@Transactional`

#### [Exception] 사용자 정의 예외 2종
- `BookNotFoundException` — 존재하지 않는 도서 id 조회/수정/삭제 시 발생 (→ 404)
- `AuthException` — 인증/회원가입 관련 실패 시 발생 (→ 401)

```java
return bookRepository.findById(id)
    .orElseThrow(() -> new BookNotFoundException(id));
```

#### [Service] `@Transactional` 적용
조회 메서드(`findAllBooks`, `findBookById`)는 `@Transactional(readOnly = true)`, 변경 메서드(`createBook`, `updateBook`, `deleteBook`, `updateCover`)는 `@Transactional`을 붙여 트랜잭션 경계를 명확히 했다.

### 미션 6 — `@RestControllerAdvice` 전역 예외 처리

`GlobalExceptionHandler`가 컨트롤러 전역에서 예외를 가로채 일관된 JSON 에러 응답으로 변환한다.

| 예외 | 상태 코드 | 응답 본문 |
|---|---|---|
| `BookNotFoundException` | 404 Not Found | `{ "error": "..." }` |
| `MethodArgumentNotValidException` (`@Valid` 실패) | 400 Bad Request | `{ "필드명": "메시지" }` |
| `AuthException` | 401 Unauthorized | `{ "error": "..." }` |

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookNotFound(BookNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", ex.getMessage()));
    }
    // ... @Valid(400), AuthException(401) 핸들러
}
```

이전엔 `GET /books/999`가 500을 던졌지만, 이제 404로 정제되어 응답된다.

---

## 4일차 산출물 (미션 7·8)

### 미션 7 — AI 표지 저장 API + 회원 인증

#### [Book] AI 표지 저장 (`PATCH /books/{id}/cover`)
Frontend가 OpenAI Images API를 직접 호출해 받은 base64 이미지를 Data URL로 변환한 뒤 서버에 저장 요청한다. 백엔드는 `coverImageUrl` 필드만 갱신.

```java
@PatchMapping("/{id}/cover")
public Book updateCover(@PathVariable Long id, @RequestBody Map<String, String> body) {
    return bookService.updateCover(id, body.get("coverImageUrl"));
}
```

#### [Auth] 회원가입 / 로그인 / 로그아웃
- `User` 엔티티 추가 (`users` 테이블): `username`(unique), `password`(BCrypt 해시), `token`(UUID)
- **비밀번호는 `BCryptPasswordEncoder`로 해시 저장** — 평문 저장 금지
- 로그인 성공 시 UUID 토큰 발급 → `User.token`에 저장 후 클라이언트에 반환
- 로그아웃 시 서버의 토큰을 `null`로 무효화

| 메서드 | URL | 설명 | 응답 |
|---|---|---|---|
| POST | `/auth/signup` | 회원가입 (BCrypt 해시 저장) | 201 + `{id, username}` |
| POST | `/auth/login` | 로그인 (토큰 발급) | 200 + `{token, username}` |
| POST | `/auth/logout` | 로그아웃 (토큰 무효화) | 204 |

#### [Interceptor] 토큰 기반 인증 (`AuthInterceptor`)
`/books/**`에 인터셉터를 걸어 **쓰기 요청(POST/PATCH/DELETE)만 인증을 요구**한다.

- `GET`·`OPTIONS`(CORS preflight) → 인증 면제 (누구나 조회 가능)
- 쓰기 요청 → `Authorization: Bearer {token}` 헤더 검사, 무효 토큰이면 `AuthException`(401)
- `/auth/**`, `/h2-console/**` → 인터셉터 제외 (`WebConfig.excludePathPatterns`)

### 미션 8 — Frontend 인증 연동 + 마무리

- **`api/auth.js`**: signup/login/logout 호출, 토큰을 `localStorage`에 저장, `authHeaders()`로 쓰기 요청에 자동 첨부
- **`context/AuthContext.jsx`**: 전역 로그인 상태(`user`, `isLoggedIn`) 관리, 새로고침 시 토큰으로 상태 복원
- **`Header.jsx`**: 로그인 상태에 따라 "로그인/회원가입" ↔ "{username} 님/로그아웃" 토글
- **`LoginPage` / `SignupPage`**: 인증 폼 화면 추가
- 이 인증 기반 위에 **마이페이지**(내 정보·내 도서·비번 변경·탈퇴)와 **찜** 기능을 추가 (아래 참고)

---

## 추가 기능 — 마이페이지 · 찜

### 마이페이지 (`MyPage.jsx`, `/mypage`)

로그인 사용자의 개인 화면. **상단 탭으로 분리**해 한 번에 하나씩만 보여준다.

| 탭 | 내용 | 연동 |
|---|---|---|
| 내 정보 | 아이디 · 가입일 + 프로필(이름/전화/이메일/선호 장르) 인라인 편집 | 가입일 `GET /auth/me`, 프로필은 localStorage |
| 내 도서 | 내가 등록한 도서 목록 | `GET /books` → `ownerUsername`으로 필터 |
| 찜 | 찜한 도서 목록 (하트로 해제) | localStorage (아래 참고) |
| 계정 | 비밀번호 변경 · 회원 탈퇴 | `PATCH /auth/password`, `DELETE /auth` |

- **도서 소유자**: 등록(POST) 시 백엔드가 **요청 본문이 아니라 토큰의 사용자**로 `Book.ownerUsername`을 설정 → 위변조 방지. (기존 시드 도서는 `null`이라 "내 도서"엔 로그인 후 새로 등록한 책부터 표시)
- **비밀번호 변경**: 현재 비번 확인(BCrypt) 후 교체, 성공 시 서버가 토큰을 무효화 → 재로그인 유도
- **회원 탈퇴**: 계정 삭제 시 등록 도서는 **삭제하지 않고 소유자만 해제**(비파괴적)

### 찜 기능 (`api/favorites.js`)

별도 백엔드 없이 **localStorage 기반**으로 구현 (`favorite_books:{username}` 키).

- 목록/상세 페이지의 하트 버튼으로 토글 → `toggleFavoriteBook`
- `CustomEvent`(`favorites-changed`) + `storage` 이벤트 구독으로 **여러 화면 실시간 동기화** (다른 탭/페이지에서 찜해도 마이페이지에 즉시 반영)

---

## 팀 R&R

| 역할 | 담당 |
|---|---|
| PM | 편진솔 |
| Backend | 이제혁 |
| Backend | 이소은 |
| 통합예외처리 | 유정환 |
| Frontend 연동 / AI | 김주형 |

---

## 🚀 실행 방법

### 백엔드 (터미널 1)
```bash
cd backend
gradlew bootRun          # Windows
./gradlew bootRun        # Mac/Linux
# http://localhost:8080/books
# http://localhost:8080/h2-console  (JDBC URL: jdbc:h2:mem:testdb)
```

### 프론트엔드 (터미널 2)
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

---

## 📅 일정

| 일차 | 미션 | 핵심 | 상태 |
|---|---|---|---|
| 1일차 | M1·M2 | 설계 + 골격 + WebConfig + Git | ✅ |
| 2일차 | M3·M4 | CRUD 5종 + Frontend 1차 연동 | ✅ |
| 3일차 | M5·M6 | 사용자 정의 예외 + `@Transactional` + `@RestControllerAdvice` | ✅ |
| 4일차 | M7·M8 | AI 표지 저장 API + 회원 인증(BCrypt+토큰) + Frontend 연동 | ✅ |
| 추가 | - | 탭형 마이페이지(내 정보·내 도서·찜·계정) + localStorage 찜 기능 | ✅ |

---

## 📑 관련 문서

- [backend/ERD.md](backend/ERD.md) — 개념·논리 ERD (Mermaid) + 테이블 명세서
- [backend/API.md](backend/API.md) — 6개 엔드포인트 상세 API 정의서

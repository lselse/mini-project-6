# 도서 관리 서비스 CI/CD 프로젝트

React 프론트엔드와 Spring Boot 백엔드로 구성된 도서 관리 서비스입니다. AI 미니프로젝트 6차 교안의 목표에 맞춰 GitHub, AWS CodeBuild, CodeDeploy, EC2, Nginx 기반의 자동 빌드/배포 흐름을 함께 구성했습니다.

## 주요 기능

- 도서 목록 조회, 상세 조회, 등록, 수정, 삭제
- 회원가입, 로그인, 로그아웃, 내 정보 조회
- 비밀번호 변경, 회원 탈퇴
- 로그인 사용자 기준 도서 등록자 저장
- 브라우저 localStorage 기반 즐겨찾기
- OpenAI Images API를 이용한 도서 표지 생성
- 생성된 base64 표지 이미지를 서버 파일(`/opt/bookapp/uploads/covers`)로 저장하고 `/uploads/**` 경로로 제공

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 19, Vite 8, React Router |
| Backend | Java 17, Spring Boot 4, Spring Web MVC, Spring Data JPA, Validation |
| Auth | BCrypt, UUID 토큰, Authorization Bearer 헤더 |
| Database | H2 file DB |
| Deploy | AWS CodeBuild, CodeDeploy, EC2, Nginx, systemd |

## 프로젝트 구조

```text
.
├── frontend/                 # React + Vite 프론트엔드
│   ├── src/api/              # books, auth, favorites, openai API 모듈
│   ├── src/pages/            # 화면 단위 컴포넌트
│   └── vite.config.js        # /api, /uploads 프록시 설정
├── backend/                  # Spring Boot 백엔드
│   ├── src/main/java/...     # Controller, Service, Entity, Repository
│   ├── src/main/resources/   # application.yaml, data.sql
│   ├── API.md                # 백엔드 API 문서
│   └── ERD.md                # 데이터 모델 문서
├── deploy-scripts/           # CodeDeploy 라이프사이클 스크립트
├── buildspec.yml             # 운영 배포용 CodeBuild 설정
├── unit-test-buildspec.yml   # 빌드 검증용 CodeBuild 설정
└── appspec.yml               # CodeDeploy 배포 매핑/훅 설정
```

## 로컬 실행

### 1. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

Windows PowerShell에서는 다음 명령을 사용할 수 있습니다.

```powershell
cd backend
.\gradlew.bat bootRun
```

백엔드는 기본적으로 `http://localhost:8080`에서 실행됩니다. H2 데이터베이스는 `application.yaml` 기준으로 `/opt/bookapp/data/bookdb` 파일 DB를 사용합니다.

### 2. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 Vite 기본 주소인 `http://localhost:5173`에서 실행됩니다. 개발 서버는 다음 경로를 백엔드로 프록시합니다.

- `/api/**` -> `http://localhost:8080/**`
- `/uploads/**` -> `http://localhost:8080/uploads/**`

## 빌드

### 프론트엔드

```bash
cd frontend
npm run build
```

결과물은 `frontend/dist`에 생성됩니다.

### 백엔드

```bash
cd backend
./gradlew clean bootJar
```

결과물은 `backend/build/libs/*.jar`에 생성됩니다.

## 주요 API

프론트엔드는 `/api` 프록시를 사용하고, 백엔드는 실제로 `/books`, `/auth` 경로를 제공합니다.

| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/books` | 도서 목록 조회 | 불필요 |
| GET | `/books/{id}` | 도서 상세 조회 | 불필요 |
| POST | `/books` | 도서 등록 | 필요 |
| PATCH | `/books/{id}` | 도서 수정 | 필요 |
| DELETE | `/books/{id}` | 도서 삭제 | 필요 |
| PATCH | `/books/{id}/cover` | 표지 이미지 저장/수정 | 필요 |
| POST | `/auth/signup` | 회원가입 | 불필요 |
| POST | `/auth/login` | 로그인 및 토큰 발급 | 불필요 |
| POST | `/auth/logout` | 로그아웃 | 필요 |
| GET | `/auth/me` | 내 정보 조회 | 필요 |
| PATCH | `/auth/password` | 비밀번호 변경 | 필요 |
| DELETE | `/auth` | 회원 탈퇴 | 필요 |

자세한 백엔드 명세는 `backend/API.md`, 데이터 모델은 `backend/ERD.md`를 참고합니다.

## 인증 방식

로그인 성공 시 백엔드는 UUID 토큰을 발급하고, 프론트엔드는 토큰과 사용자명을 localStorage에 저장합니다. 등록, 수정, 삭제, 표지 저장 등 변경 요청에는 다음 헤더가 포함되어야 합니다.

```http
Authorization: Bearer {token}
```

GET 요청과 CORS preflight 요청은 인증 없이 통과합니다.

## AI 표지 생성

프론트엔드는 사용자가 입력한 OpenAI API Key로 Images API를 직접 호출해 표지를 생성합니다. 생성 결과는 Data URL 형태로 백엔드에 전달되고, 백엔드는 이미지를 `/opt/bookapp/uploads/covers`에 저장한 뒤 `/uploads/covers/{filename}` URL을 도서 데이터에 저장합니다.

배포 환경에서는 Nginx가 `/uploads/` 요청을 `/opt/bookapp/uploads/`로 매핑합니다.

## CI/CD 흐름

1. GitHub 저장소에 변경 사항을 push합니다.
2. AWS CodeBuild가 `buildspec.yml`을 기준으로 프론트엔드 의존성 설치 및 빌드를 수행합니다.
3. 백엔드는 Gradle Wrapper로 `bootJar`를 생성합니다.
4. 빌드 산출물(`frontend/dist`, `backend/build/libs/*.jar`, `appspec.yml`, `deploy-scripts`)이 배포 아티팩트로 묶입니다.
5. AWS CodeDeploy가 EC2에 아티팩트를 배포합니다.
6. `before_install.sh`가 기존 서비스와 파일을 정리합니다.
7. `application_start.sh`가 Java, curl, Nginx를 확인/설치하고 `bookapp.service`와 Nginx 프록시를 설정합니다.
8. `validate_service.sh`가 프론트엔드 정적 파일, Nginx, 백엔드 `/books` 응답을 검증합니다.

## 배포 경로

| 항목 | 경로 |
|---|---|
| 프론트엔드 정적 파일 | `/var/www/html` |
| 백엔드 애플리케이션 | `/opt/bookapp/bookapp.jar` |
| H2 데이터베이스 | `/opt/bookapp/data/bookdb` |
| 업로드 표지 이미지 | `/opt/bookapp/uploads/covers` |
| systemd 서비스 | `bookapp.service` |
| Nginx 설정 | `/etc/nginx/conf.d/bookapp.conf` |

## Nginx 라우팅

배포 스크립트는 다음 Nginx 설정을 생성합니다.

- `/` : React 정적 파일 제공 및 SPA fallback
- `/api/` : `http://127.0.0.1:8080/`로 프록시
- `/uploads/` : `/opt/bookapp/uploads/` 파일 제공

## 참고 사항

- `frontend/src/api/openai.js`에서 OpenAI API Key는 브라우저에서 입력받아 사용합니다. 운영 서비스에서는 보안상 서버 프록시 방식으로 전환하는 것이 좋습니다.
- 현재 여러 소스 파일의 기존 한글 주석은 인코딩이 깨져 있습니다. README는 UTF-8 한글로 새로 정리했습니다.
- H2 콘솔은 `/h2-console`로 활성화되어 있습니다.
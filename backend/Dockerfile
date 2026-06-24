FROM node:20-slim

WORKDIR /app

# 1. 패키지 파일만 먼저 복사 (캐싱 활용)
COPY package*.json ./

# 2. 의존성 설치
RUN npm install

# 3. 나머지 소스 코드 전체 복사
COPY . .

# 4. 앱이 사용하는 포트를 8080으로 명시
EXPOSE 8080

# 5. 서버 실행 명령어 (시작 파일명이 다르면 index.js 부분을 수정하세요)
CMD ["node", "index.js"]
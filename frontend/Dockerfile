# Nginx 웹 서버 사용
FROM nginx:alpine

# 핵심 추가: 404 에러 방지용 커스텀 Nginx 설정 파일 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite 빌드 결과물인 dist 폴더를 Nginx의 기본 HTML 경로로 복사
COPY dist/ /usr/share/nginx/html

# Nginx가 80번 포트로 통신하도록 설정
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
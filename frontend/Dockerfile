# Nginx 웹 서버 사용
FROM nginx:alpine

# Vite 빌드 결과물인 dist 폴더를 Nginx의 기본 HTML 경로로 복사
COPY dist/ /usr/share/nginx/html

# Nginx가 80번 포트로 통신하도록 설정
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
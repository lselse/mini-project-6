FROM public.ecr.aws/amazoncorretto/amazoncorretto:17-alpine-full

# 빌드된 JAR 파일을 컨테이너의 app.jar로 복사
# (주의: build/libs/ 폴더에 jar 파일이 생성되어 있어야 함)
COPY build/libs/*.jar app.jar

# 컨테이너 실행 시 jar 실행
ENTRYPOINT ["java", "-jar", "/app.jar"]
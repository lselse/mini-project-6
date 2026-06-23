package com.aivle.bookapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**") // 모든 백엔드 주소에 대해서
                .allowedOrigins("http://localhost:5173", "http://localhost:3000") // 리액트 주소의 접근을 허락한다
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS") // 이 행동들을 허락한다
                .allowedHeaders("*"); // Authorization 헤더 포함 모두 허용
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/books/**") // 도서 관련 모든 경로
                .excludePathPatterns("/auth/**", "/h2-console/**"); // 인증/H2 콘솔은 면제
        // GET 요청은 인터셉터 안에서 별도로 통과시킴
    }
}

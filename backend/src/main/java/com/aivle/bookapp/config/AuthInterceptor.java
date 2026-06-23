package com.aivle.bookapp.config;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.aivle.bookapp.domain.User;
import com.aivle.bookapp.exception.AuthException;
import com.aivle.bookapp.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * 인증 인터셉터:
 * - 등록(POST), 수정(PATCH), 삭제(DELETE) 요청은 Authorization: Bearer {token} 헤더 필수
 * - GET (목록/상세 조회) 및 /auth/** 는 인증 면제 (WebConfig의 excludePathPatterns 참고)
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String method = request.getMethod();

        // GET 요청 + OPTIONS(CORS preflight)는 인증 면제
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Authorization 헤더 검사
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthException("로그인이 필요합니다.");
        }

        String token = authHeader.substring(7);
        User user = authService.findByToken(token); // 무효 토큰이면 AuthException

        // 인증된 사용자 정보를 request에 저장 (필요시 컨트롤러에서 사용 가능)
        request.setAttribute("currentUser", user);
        return true;
    }
}

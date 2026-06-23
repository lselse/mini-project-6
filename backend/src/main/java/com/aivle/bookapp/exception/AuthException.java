package com.aivle.bookapp.exception;

/**
 * 인증 실패 예외 (401 Unauthorized).
 * - 로그인 시 username/password 불일치
 * - 토큰 누락 또는 만료/무효
 */
public class AuthException extends RuntimeException {

    public AuthException(String message) {
        super(message);
    }
}

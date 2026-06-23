package com.aivle.bookapp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aivle.bookapp.domain.User;
import com.aivle.bookapp.exception.AuthException;
import com.aivle.bookapp.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new AuthException("아이디와 비밀번호를 모두 입력해주세요.");
        }

        User user = authService.signup(username, password);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            throw new AuthException("아이디와 비밀번호를 입력해주세요.");
        }

        User user = authService.login(username, password);

        Map<String, Object> response = new HashMap<>();
        response.put("token", user.getToken());
        response.put("username", user.getUsername());
        return ResponseEntity.ok(response);
    }

    // 로그아웃 (토큰 무효화)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.noContent().build();
    }

    // 내 정보 조회 (마이페이지)
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = requireUser(authHeader);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("createdAt", user.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    // 비밀번호 변경
    @PatchMapping("/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {
        User user = requireUser(authHeader);
        authService.changePassword(user, body.get("currentPassword"), body.get("newPassword"));

        Map<String, Object> response = new HashMap<>();
        response.put("message", "비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        return ResponseEntity.ok(response);
    }

    // 회원 탈퇴
    @DeleteMapping
    public ResponseEntity<Void> withdraw(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = requireUser(authHeader);
        authService.deleteAccount(user);
        return ResponseEntity.noContent().build();
    }

    // /auth/** 는 인터셉터 면제 경로라 토큰을 직접 검증
    private User requireUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthException("로그인이 필요합니다.");
        }
        return authService.findByToken(authHeader.substring(7));
    }
}

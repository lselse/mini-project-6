package com.aivle.bookapp.service;

import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.domain.User;
import com.aivle.bookapp.exception.AuthException;
import com.aivle.bookapp.repository.BookRepository;
import com.aivle.bookapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 회원가입
    @Transactional
    public User signup(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new AuthException("이미 사용 중인 아이디입니다.");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password)); // BCrypt 해시 저장
        return userRepository.save(user);
    }

    // 로그인 — 성공 시 UUID 토큰 발급해서 User에 저장 후 반환
    @Transactional
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        user.setToken(UUID.randomUUID().toString());
        return userRepository.save(user);
    }

    // 토큰으로 사용자 조회 (인터셉터에서 사용)
    @Transactional(readOnly = true)
    public User findByToken(String token) {
        return userRepository.findByToken(token)
                .orElseThrow(() -> new AuthException("유효하지 않은 토큰입니다."));
    }

    // 로그아웃 — 토큰 무효화
    @Transactional
    public void logout(String token) {
        userRepository.findByToken(token).ifPresent(user -> {
            user.setToken(null);
            userRepository.save(user);
        });
    }

    // 비밀번호 변경 — 현재 비밀번호 확인 후 새 비밀번호로 교체
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new AuthException("새 비밀번호를 입력해주세요.");
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AuthException("현재 비밀번호가 올바르지 않습니다.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setToken(null); // 비밀번호 변경 후 재로그인 유도
        userRepository.save(user);
    }

    // 회원 탈퇴 — 등록한 도서는 소유자만 해제(보존)하고 계정 삭제
    @Transactional
    public void deleteAccount(User user) {
        List<Book> myBooks = bookRepository.findByOwnerUsername(user.getUsername());
        for (Book book : myBooks) {
            book.setOwnerUsername(null);
        }
        bookRepository.saveAll(myBooks);
        userRepository.delete(user);
    }
}

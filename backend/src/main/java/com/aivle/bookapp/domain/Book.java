package com.aivle.bookapp.domain;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 도서 고유 번호 (자동 생성)

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
    @Column(nullable = false)
    private String title; // 도서 제목 (필수)

    @NotBlank(message = "저자는 필수입니다.")
    @Size(max = 100, message = "저자명은 100자 이하여야 합니다.")
    @Column(nullable = false)
    private String author; // 저자명 (필수)

    @Column(columnDefinition = "TEXT")
    private String content; // 도서 상세 내용

    private String category = "소설"; // 기본값 세팅

    @Column(columnDefinition = "TEXT")
    private String coverImageUrl; // AI 표지 이미지 주소 (base64 Data URL)

    @Column(length = 50)
    private String ownerUsername; // 등록한 사용자 (토큰에서 서버가 채움, 시드/탈퇴 도서는 null)

    // 4차 프론트엔드(books.js)가 등록일/수정일을 표시하므로 추가
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

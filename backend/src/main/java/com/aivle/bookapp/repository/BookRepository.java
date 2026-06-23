package com.aivle.bookapp.repository;

import java.util.List;

import com.aivle.bookapp.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {

    // 특정 사용자가 등록한 도서 (탈퇴 시 소유자 해제용)
    List<Book> findByOwnerUsername(String ownerUsername);
}
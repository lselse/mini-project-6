package com.aivle.bookapp.service;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.exception.BookNotFoundException;
import com.aivle.bookapp.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    // 1. 도서 목록 전체 조회
    @Transactional(readOnly = true)
    public List<Book> findAllBooks() {
        return bookRepository.findAll(); // DB에 있는 모든 책을 가져옵니다.
    }

    // 2. 특정 도서 상세 조회
    @Transactional(readOnly = true)
    public Book findBookById(Long id) {
        // ID로 책을 찾고, 없으면 BookNotFoundException 발생.
        // 미션 6에서 GlobalExceptionHandler가 이 예외를 잡아 404 응답으로 변환할 예정.
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }
    // 3. 신규 도서 등록
    @Transactional
    public Book createBook(Book book) {
        return bookRepository.save(book); // DB에 새 책을 저장합니다.
    }

    // 4. 도서 정보 수정 (부분 수정 - PATCH)
    @Transactional
    public Book updateBook(Long id, Book patchBook) {
        // 먼저 기존 책이 있는지 찾습니다.
        Book existingBook = findBookById(id);

        // 프론트엔드에서 수정하라고 보낸(null이 아닌) 데이터만 골라서 업데이트합니다.
        if (patchBook.getTitle() != null) existingBook.setTitle(patchBook.getTitle());
        if (patchBook.getAuthor() != null) existingBook.setAuthor(patchBook.getAuthor());
        if (patchBook.getContent() != null) existingBook.setContent(patchBook.getContent());
        if (patchBook.getCategory() != null) existingBook.setCategory(patchBook.getCategory());
        if (patchBook.getCoverImageUrl() != null) {
            existingBook.setCoverImageUrl(patchBook.getCoverImageUrl());
        }

        return bookRepository.save(existingBook);
    }

    // 5. 도서 삭제
    @Transactional
    public void deleteBook(Long id) {
        bookRepository.deleteById(id); // ID에 해당하는 책을 DB에서 삭제합니다.
    }

    // 6. 표지 URL 업데이트
    @Transactional
    public Book updateCover(Long id, String coverImageUrl) {
        Book existingBook = findBookById(id);

        existingBook.setCoverImageUrl(coverImageUrl);

        return bookRepository.save(existingBook);
    }

}
package com.aivle.bookapp.controller;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.domain.User;
import com.aivle.bookapp.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // 1. 도서 목록 조회 API (GET /books)
    @GetMapping
    public List<Book> getBooks() {
        return bookService.findAllBooks();
    }

    // 2. 도서 상세 조회 API (GET /books/{id})
    @GetMapping("/{id}")
    public Book getBook(@PathVariable Long id) {
        return bookService.findBookById(id);
    }
    // 3. 신규 도서 등록 (POST)
    @PostMapping
    public Book createBook(
            @Valid @RequestBody Book book,
            @RequestAttribute(value = "currentUser", required = false) User currentUser) {
        // 소유자는 클라이언트 값이 아니라 인증 토큰의 사용자로 서버가 직접 설정
        if (currentUser != null) {
            book.setOwnerUsername(currentUser.getUsername());
        }
        return bookService.createBook(book);
    }

    // 4. 도서 정보 수정 (PATCH)
    @PatchMapping("/{id}")
    public Book updateBook(@PathVariable Long id, @RequestBody Book patchBook) {
        return bookService.updateBook(id, patchBook);
    }

    // 5. 도서 삭제 (DELETE)
    @DeleteMapping("/{id}")
    public void deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
    }

    // 6. 표지 URL 저장 (PATCH /books/{id}/cover)
    @PatchMapping("/{id}/cover")
    public Book updateCover(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {

        return bookService.updateCover(
                id,
                body.get("coverImageUrl")
        );
    }
}
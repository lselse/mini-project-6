package com.aivle.bookapp.exception;

/**
 * 도서를 찾을 수 없을 때 발생하는 사용자 정의 예외.
 * BookService.findBookById()에서 도서가 없으면 던진다.
 * 미션 6의 GlobalExceptionHandler에서 이 예외를 잡아 404 응답으로 변환할 예정.
 */
public class BookNotFoundException extends RuntimeException {

    public BookNotFoundException(Long id) {
        super("해당 ID의 도서가 없습니다: " + id);
    }
}

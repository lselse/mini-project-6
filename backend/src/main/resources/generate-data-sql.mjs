/**
 * 시드 도서를 data.sql 형식으로 자동 생성하는 스크립트.
 *
 * 사용법:
 *   1. 백엔드(8080) 실행 중 + 시드 8권 표지 모두 생성·저장 완료된 상태
 *   2. CMD에서: cd backend/src/main/resources && node generate-data-sql.mjs
 *   3. data.sql이 자동으로 갱신됨
 *
 * 결과:
 *   - 현재 books 테이블의 모든 책 + 표지를 멱등 INSERT 형식으로 저장
 *   - WHERE NOT EXISTS 패턴이라 재실행해도 중복 안 됨
 */

import { writeFileSync } from 'node:fs';

const BACKEND_URL = 'http://localhost:8080/books';
const OUTPUT_PATH = './data.sql';

function escapeSql(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/'/g, "''"); // SQL 작은따옴표 이스케이프
}

function buildInsert(book) {
  const title = escapeSql(book.title);
  const author = escapeSql(book.author);
  const category = escapeSql(book.category || '소설');
  const content = escapeSql(book.content || '');
  const coverImageUrl = escapeSql(book.coverImageUrl || '');

  return `INSERT INTO books (title, author, category, content, cover_image_url, created_at, updated_at)
SELECT '${title}', '${author}', '${category}', '${content}', '${coverImageUrl}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = '${title}');\n`;
}

async function main() {
  console.log(`→ ${BACKEND_URL} 에서 도서 데이터 가져오는 중...`);

  let books;
  try {
    const res = await fetch(BACKEND_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    books = await res.json();
  } catch (err) {
    console.error('❌ 백엔드 호출 실패:', err.message);
    console.error('   백엔드가 8080 포트에 떠있는지 확인해주세요.');
    process.exit(1);
  }

  if (!Array.isArray(books) || books.length === 0) {
    console.error('❌ 도서가 없습니다. 먼저 시드 데이터를 등록하세요.');
    process.exit(1);
  }

  console.log(`✓ ${books.length}권 가져옴`);

  const header = `-- 멱등(idempotent) 시드 — 이미 같은 title이 있으면 INSERT 안 함
-- 자동 생성됨: generate-data-sql.mjs (재생성 시 덮어씌워짐)

`;

  const body = books.map(buildInsert).join('\n');

  writeFileSync(OUTPUT_PATH, header + body, 'utf8');

  console.log(`✓ ${OUTPUT_PATH} 저장 완료`);
  console.log(`   파일 크기: ${(Buffer.byteLength(header + body) / 1024).toFixed(1)} KB`);

  const withCover = books.filter(b => b.coverImageUrl && b.coverImageUrl.length > 0).length;
  console.log(`   표지 있는 책: ${withCover} / ${books.length}`);
}

main();

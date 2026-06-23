import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks } from '../api/books';
import { getFavoriteIds, toggleFavoriteBook } from '../api/favorites';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants';
import bannerImage from "../assets/banner.png";



function BookListPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  // 뷰 모드 상태 추가 ('grid' 또는 'list')
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await getBooks();
        setBooks(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
  }, [isLoggedIn]);

  const handleFavorite = (e, bookId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('로그인 후 찜할 수 있습니다.');
      navigate('/login');
      return;
    }

    toggleFavoriteBook(bookId);
    setFavoriteIds(getFavoriteIds());
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === '전체' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page">
        <div className="hero-banner">
          <img src={bannerImage} alt="Hero Banner" />
        </div>


      <div className="page-head">
        <h1>도서 목록</h1>
        {isLoggedIn ? (
          <button className="btn btn-primary" onClick={() => navigate('/books/new')}>
            + 신규 등록
          </button>
        ) : (
          <button className="btn" onClick={() => navigate('/login')} title="로그인 후 도서를 등록할 수 있습니다.">
            로그인하고 등록하기
          </button>
        )}
      </div>

      {!loading && !error && books.length > 0 && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="도서 제목이나 작가명으로 검색해보세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="전체">전체 카테고리</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* 뷰 모드 토글 버튼 추가 */}
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              ⊞ 
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              ≣ 
            </button>
          </div>
        </div>
      )}

      {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>불러오는 중...</div>}

      {error && (
        <div style={{ padding: 16, background: '#fee', color: '#c0392b', borderRadius: 4, marginBottom: 16 }}>
          {error}
          <div style={{ fontSize: 12, marginTop: 4, color: '#888' }}>
            json-server가 실행 중인지 확인해주세요 (npx json-server@0.17.4 --watch db.json --port 3000)
          </div>
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>등록된 도서가 없습니다.</div>
      )}

      {!loading && !error && books.length > 0 && filteredBooks.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>검색 결과가 없습니다.</div>
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        /* viewMode 상태에 따라 클래스명 변경 */
        <div className={viewMode === 'grid' ? 'book-grid' : 'book-list-view'}>
          {filteredBooks.map((book) => (
            <article key={book.id} className="book-card">
              <Link to={`/books/${book.id}`} className="book-card-link">
                <div className="book-cover">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} />
                  ) : (
                    <span>표지 없음<br />(생성 전)</span>
                  )}
                </div>

                {/* 텍스트 영역을 묶어주는 div 추가 (리스트 뷰에서 레이아웃을 잡기 위함) */}
                <div className="book-info">
                  {book.category && (
                    <div className="category-badge" data-category={book.category}>{book.category}</div>
                  )}
                  <div className="book-title">{book.title}</div>
                  <div className="book-meta">
                    {book.author} · {new Date(book.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </Link>
              <button
                type="button"
                className={favoriteIds.includes(String(book.id)) ? 'favorite-icon-btn active' : 'favorite-icon-btn'}
                onClick={(e) => handleFavorite(e, book.id)}
                title={favoriteIds.includes(String(book.id)) ? '찜 해제' : '찜하기'}
                aria-label={favoriteIds.includes(String(book.id)) ? '찜 해제' : '찜하기'}
              >
                {favoriteIds.includes(String(book.id)) ? '♥' : '♡'}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookListPage;

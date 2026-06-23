import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      <div className="floating-books" aria-hidden="true">
        <span className="floating-book book-a" />
        <span className="floating-book book-b" />
        <span className="floating-book book-c" />
        <span className="floating-book book-d" />
        <span className="floating-book book-e" />
      </div>

      <h1 className="home-title">
        도서 관리 시스템
      </h1>
      <p className="home-subtitle">
        원하는 도서를 자유롭게 등록하고 관리해보세요.
      </p>
      <button 
        className="btn btn-primary home-cta" 
        onClick={() => navigate('/books')}
      >
        도서 목록 보러가기
      </button>
    </div>
  );
}

export default HomePage;

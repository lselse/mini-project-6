import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    await logout();
    alert('로그아웃되었습니다.');
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className="logo">도서 관리</Link>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link to="/">홈</Link>
            <Link to="/books">도서 목록</Link>
          </nav>
        </div>
        <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link to="/mypage" style={{ fontSize: 14 }}>
                마이페이지
              </Link>

              <span style={{ fontSize: 13, color: '#666' }}>
                <strong>{user.username}</strong> 님
              </span>

              <button
                className="btn"
                onClick={handleLogout}
                style={{ fontSize: 13 }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: 14 }}>
                로그인
              </Link>

              <Link to="/signup" style={{ fontSize: 14 }}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

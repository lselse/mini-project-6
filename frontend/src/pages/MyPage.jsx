import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/auth';
import { getBooks } from '../api/books';
import { getFavoriteIds, subscribeFavoritesChanged, toggleFavoriteBook } from '../api/favorites';

const TABS = [
  { key: 'info', label: '내 정보' },
  { key: 'books', label: '내 도서' },
  { key: 'favorites', label: '찜' },
  { key: 'account', label: '계정' },
];

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, changePassword, deleteAccount } = useAuth();

  const [activeTab, setActiveTab] = useState('info');

  // 서버 정보 (가입일 등)
  const [serverInfo, setServerInfo] = useState(null);

  // localStorage 기반 프로필 (이름/전화/이메일/선호 장르)
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', genre: '' });
  const [isEditing, setIsEditing] = useState(false);

  // 내가 등록한 도서
  const [myBooks, setMyBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // 찜한 도서
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  // 비밀번호 변경 폼
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // localStorage 프로필 불러오기
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`profile_${user.username}`);
    if (saved) setProfile(JSON.parse(saved));
  }, [user]);

  // 서버 정보(가입일) + 내가 등록한 도서 불러오기
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    let active = true;
    (async () => {
      try {
        const [me, books] = await Promise.all([getMe(), getBooks()]);
        if (!active) return;
        setServerInfo(me);
        setMyBooks(books.filter((b) => b.ownerUsername === user.username));
      } catch (err) {
        console.error('[MyPage]', err);
      } finally {
        if (active) setBooksLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isLoggedIn, user]);

  // 찜한 도서 불러오기 + 다른 페이지에서 찜 변경 시 실시간 반영
  useEffect(() => {
    if (!isLoggedIn) return;
    const loadFavoriteBooks = async () => {
      try {
        const books = await getBooks();
        const favoriteIds = getFavoriteIds();
        setFavoriteBooks(books.filter((book) => favoriteIds.includes(String(book.id))));
      } catch {
        setFavoriteBooks([]);
      }
    };
    loadFavoriteBooks();
    return subscribeFavoritesChanged(loadFavoriteBooks);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="mypage-card">
        <h1>👤 마이페이지</h1>
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  // ── localStorage 프로필 편집 ──
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleProfileSave = () => {
    localStorage.setItem(`profile_${user.username}`, JSON.stringify(profile));
    setIsEditing(false);
    alert('회원 정보가 저장되었습니다.');
  };

  // ── 찜 해제 ──
  const handleRemoveFavorite = (bookId) => {
    toggleFavoriteBook(bookId);
    setFavoriteBooks((books) => books.filter((book) => String(book.id) !== String(bookId)));
  };

  // ── 비밀번호 변경 ──
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    if (pwError) setPwError('');
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword) {
      setPwError('현재 비밀번호와 새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setPwSubmitting(true);
      await changePassword(currentPassword, newPassword);
      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setPwError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPwSubmitting(false);
    }
  };

  // ── 회원 탈퇴 ──
  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?\n탈퇴해도 등록하신 도서는 삭제되지 않고 보존됩니다.')) return;
    try {
      await deleteAccount();
      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/');
    } catch (err) {
      alert(err.message || '회원 탈퇴에 실패했습니다.');
    }
  };

  return (
    <div className="mypage-card">
      <h1>👤 마이페이지</h1>

      <div className="mypage-tabs">
        {TABS.map((tab) => {
          const count =
            tab.key === 'books' ? (booksLoading ? null : myBooks.length)
              : tab.key === 'favorites' ? favoriteBooks.length
                : null;
          return (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}{count != null ? ` ${count}` : ''}
            </button>
          );
        })}
      </div>

      {/* 내 정보 */}
      {activeTab === 'info' && (
        <div className="profile-box">
          <div className="profile-item">
            <span className="profile-label">아이디</span>
            <span className="profile-value">{user.username}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">가입일</span>
            <span className="profile-value">
              {serverInfo?.createdAt
                ? new Date(serverInfo.createdAt).toLocaleDateString('ko-KR')
                : '불러오는 중...'}
            </span>
          </div>

          {isEditing ? (
            <>
              <div className="profile-item">
                <span className="profile-label">이름</span>
                <input className="profile-input" name="name" value={profile.name} onChange={handleProfileChange} />
              </div>
              <div className="profile-item">
                <span className="profile-label">전화번호</span>
                <input className="profile-input" name="phone" value={profile.phone} onChange={handleProfileChange} />
              </div>
              <div className="profile-item">
                <span className="profile-label">이메일</span>
                <input className="profile-input" name="email" value={profile.email} onChange={handleProfileChange} />
              </div>
              <div className="profile-item">
                <span className="profile-label">선호 장르</span>
                <input className="profile-input" name="genre" value={profile.genre} onChange={handleProfileChange} />
              </div>
              <div className="mypage-buttons">
                <button className="edit-btn" onClick={handleProfileSave}>저장</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>취소</button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-item">
                <span className="profile-label">이름</span>
                <span className="profile-value">{profile.name || '미입력'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">전화번호</span>
                <span className="profile-value">{profile.phone || '미입력'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">이메일</span>
                <span className="profile-value">{profile.email || '미입력'}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">선호 장르</span>
                <span className="profile-value">{profile.genre || '미입력'}</span>
              </div>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                회원 정보 수정
              </button>
            </>
          )}
        </div>
      )}

      {/* 내가 등록한 도서 */}
      {activeTab === 'books' && (
        <div className="profile-box">
          {booksLoading ? (
            <p className="profile-value">불러오는 중...</p>
          ) : myBooks.length === 0 ? (
            <div className="empty-favorites">
              <p>아직 등록한 도서가 없습니다.</p>
              <Link to="/books/new" className="btn btn-primary">도서 등록하러 가기</Link>
            </div>
          ) : (
            <div className="mypage-book-list">
              {myBooks.map((book) => (
                <div key={book.id} className="mypage-book-item">
                  <Link to={`/books/${book.id}`} className="mypage-book-link">
                    <div className="mypage-book-cover">
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} />
                      ) : (
                        <span>표지 없음</span>
                      )}
                    </div>
                    <div>
                      {book.category && (
                        <span className="category-badge" data-category={book.category}>{book.category}</span>
                      )}
                      <strong>{book.title}</strong>
                      <p>{book.author} · {new Date(book.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 찜한 도서 */}
      {activeTab === 'favorites' && (
        <div className="profile-box">
          {favoriteBooks.length > 0 ? (
            <div className="mypage-favorite-list">
              {favoriteBooks.map((book) => (
                <div key={book.id} className="mypage-favorite-item">
                  <Link to={`/books/${book.id}`} className="mypage-favorite-link">
                    <div className="mypage-favorite-cover">
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} />
                      ) : (
                        <span>표지 없음</span>
                      )}
                    </div>
                    <div>
                      {book.category && (
                        <span className="category-badge" data-category={book.category}>{book.category}</span>
                      )}
                      <strong>{book.title}</strong>
                      <p>{book.author} · {new Date(book.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </Link>
                  <button className="favorite-icon-btn active" onClick={() => handleRemoveFavorite(book.id)} title="찜 해제" aria-label="찜 해제">
                    ♥
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-favorites">
              <p>아직 찜한 도서가 없습니다.</p>
              <Link to="/books" className="btn btn-primary">찜하러 가기</Link>
            </div>
          )}
        </div>
      )}

      {/* 계정 — 비밀번호 변경 / 회원 탈퇴 */}
      {activeTab === 'account' && (
        <>
          <div className="profile-box">
            <h2>비밀번호 변경</h2>
            <form onSubmit={handlePwSubmit}>
              <div className="profile-item">
                <span className="profile-label">현재 비밀번호</span>
                <input
                  type="password"
                  className="profile-input"
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  autoComplete="current-password"
                />
              </div>
              <div className="profile-item">
                <span className="profile-label">새 비밀번호</span>
                <input
                  type="password"
                  className="profile-input"
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                />
              </div>
              <div className="profile-item">
                <span className="profile-label">새 비밀번호 확인</span>
                <input
                  type="password"
                  className="profile-input"
                  name="confirmPassword"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                />
              </div>
              {pwError && (
                <p className="profile-value" style={{ color: '#c0392b' }}>{pwError}</p>
              )}
              <button type="submit" className="edit-btn" disabled={pwSubmitting}>
                {pwSubmitting ? '변경 중...' : '변경하기'}
              </button>
            </form>
          </div>

          <div className="profile-box">
            <h2>회원 탈퇴</h2>
            <p className="profile-value" style={{ marginBottom: 16 }}>
              탈퇴 시 계정이 삭제되며 복구할 수 없습니다. 등록하신 도서는 삭제되지 않고 보존됩니다.
            </p>
            <button className="edit-btn" onClick={handleWithdraw} style={{ background: '#c0392b' }}>
              회원 탈퇴
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MyPage;

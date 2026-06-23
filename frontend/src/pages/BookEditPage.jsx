import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { getBook, updateBook, updateCover } from '../api/books';
import { generateBookCover } from '../api/openai';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, DEFAULT_CATEGORY } from '../constants';

function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // 비로그인 시 로그인 페이지로
  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const [form, setForm] = useState({ title: '', author: '', content: '', category: DEFAULT_CATEGORY });
  const [errors, setErrors] = useState({}); // 유효성 검사 에러 상태

  const [apiKey, setApiKey] = useState('');
  const [quality, setQuality] = useState('MEDIUM');
  const [coverStyle, setCoverStyle] = useState('DEFAULT'); // 스타일 상태 추가
  const [coverImage, setCoverImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await getBook(id);
        setForm({
          title: data.title,
          author: data.author,
          content: data.content,
          category: data.category || DEFAULT_CATEGORY,
        });
        setCoverImage(data.coverImageUrl || '');
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      alert('OpenAI API Key를 입력해주세요.');
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 입력한 후 생성해주세요.');
      return;
    }
    try {
      setGenerating(true);
      const dataUrl = await generateBookCover({
        apiKey,
        book: {
          title: form.title.trim(),
          author: form.author.trim() || '저자 미상',
          category: form.category,
          content: form.content.trim(),
        },
        quality,
        style: coverStyle,
      });
      setCoverImage(dataUrl);
    } catch (err) {
      alert(`표지 재생성 실패: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleRemoveCover = () => {
    if (!coverImage) return;
    if (window.confirm('정말 표지 이미지를 삭제하시겠습니까?\n(수정 내용을 저장해야 완전히 반영됩니다.)')) {
      setCoverImage('');
    }
  };

  // 폼 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = '제목을 입력해주세요.';
    else if (form.title.length > 50) newErrors.title = '제목은 50자 이내로 입력해주세요.';

    if (!form.author.trim()) newErrors.author = '작가를 입력해주세요.';
    else if (form.author.length > 20) newErrors.author = '작가는 20자 이내로 입력해주세요.';

    if (!form.content.trim()) newErrors.content = '내용을 입력해주세요.';
    else if (form.content.length < 10) newErrors.content = '내용은 최소 10자 이상 상세히 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return; // 유효성 검사 실패 시 중단

    try {
      setSubmitting(true);
      // 기본 필드 수정 (PATCH /books/{id})
      await updateBook(id, {
        title: form.title.trim(),
        author: form.author.trim(),
        content: form.content.trim(),
        category: form.category,
      });
      // 표지 저장 (PATCH /books/{id}/cover) — 백엔드 updateBook이 coverImageUrl을 처리하지 않으므로 별도 호출
      await updateCover(id, coverImage);
      alert('수정되었습니다.');
      navigate(`/books/${id}`);
    } catch (err) {
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page" style={{ padding: 40, textAlign: 'center', color: '#888' }}>불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div style={{ padding: 16, background: '#fee', color: '#c0392b', borderRadius: 4 }}>{error}</div>
        <Link to={`/books/${id}`} className="back-btn" style={{ marginTop: 16, display: 'inline-block' }}>← 상세로</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <Link to={`/books/${id}`} className="back-btn">← 상세로</Link>
        <h1 style={{ fontSize: 20 }}>도서 수정</h1>
      </div>

      <div className="form-layout">
        <div>
          <div className="form-group">
            <label>
              제목<span className="required">*</span>
            </label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <div className="error-msg">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label>
              작가<span className="required">*</span>
            </label>
            <input 
              name="author" 
              value={form.author} 
              onChange={handleChange} 
              className={errors.author ? 'input-error' : ''}
            />
            {errors.author && <div className="error-msg">{errors.author}</div>}
          </div>

          <div className="form-group">
            <label>
              카테고리<span className="required">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              내용<span className="required">*</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content && <div className="error-msg">{errors.content}</div>}
          </div>

          <div className="ai-section">
            <div className="ai-section-title">
              AI 표지 {coverImage ? '재생성' : '생성'}
              <span style={{ fontSize: 11, color: '#888', fontWeight: 400, marginLeft: 6 }}>
                선택
              </span>
            </div>
            <div className="ai-section-desc">
              {coverImage
                ? '현재 표지를 새로 생성합니다. 우측 미리보기에서 결과 확인 후 저장하세요.'
                : '새로운 표지를 생성합니다. 우측 미리보기에서 결과 확인 후 저장하세요.'}
            </div>

            <div className="form-group">
              <label style={{ fontSize: 12 }}>OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: 12 }}>퀄리티 (quality)</label>
              <div className="quality-row">
                {['LOW', 'MEDIUM', 'HIGH'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`quality-btn ${quality === q ? 'active' : ''}`}
                    onClick={() => setQuality(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: 12 }}>스타일 (Style)</label>
              <div className="quality-row" style={{ flexWrap: 'wrap' }}>
                {[
                  { id: 'DEFAULT', label: '기본' },
                  { id: 'WATERCOLOR', label: '수채화' },
                  { id: 'ILLUSTRATION', label: '일러스트' },
                  { id: '3D', label: '3D' },
                  { id: 'REALISTIC', label: '실사' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`quality-btn ${coverStyle === s.id ? 'active' : ''}`}
                    onClick={() => setCoverStyle(s.id)}
                    style={{ minWidth: '60px' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-ai" onClick={handleGenerate} disabled={generating || submitting}>
              {generating ? '생성 중... (수십초 소요)' : (coverImage ? 'AI 표지 재생성하기' : 'AI 표지 생성하기')}
            </button>
          </div>

          <div className="form-actions">
            <button className="btn" onClick={() => navigate(`/books/${id}`)} disabled={submitting || generating}>
              취소
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || generating}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <div className="cover-preview-panel">
          <div className="cover-preview-label">표지 미리보기</div>
          <div className="cover-preview">
            {generating ? (
              <>
                <div className="icon spinning">✦</div>
                <div>AI가 표지를<br />생성하고 있어요...</div>
              </>
            ) : coverImage ? (
              <img src={coverImage} alt="표지" />
            ) : (
              <>
                <div className="icon">▤</div>
                <div>
                  현재 표지<br />(저장됨)
                </div>
              </>
            )}
          </div>
          <div className="preview-meta">재생성 후 저장 시 표지가 갱신됩니다</div>
          {coverImage && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={handleRemoveCover}
              disabled={generating || submitting}
            >
              표지 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookEditPage;
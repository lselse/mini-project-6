import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createBook } from '../api/books';
import { generateBookCover } from '../api/openai';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, DEFAULT_CATEGORY } from '../constants';

function BookCreatePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // 비로그인 시 로그인 페이지로
  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const [form, setForm] = useState({
    title: '',
    author: '',
    content: '',
    category: DEFAULT_CATEGORY,
  });

  const [errors, setErrors] = useState({}); // 유효성 검사 에러 상태 추가
  const [apiKey, setApiKey] = useState('');
  const [quality, setQuality] = useState('MEDIUM');
  const [coverStyle, setCoverStyle] = useState('DEFAULT'); // 스타일 상태 추가
  const [coverImage, setCoverImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // 사용자가 입력하면 해당 필드의 에러 메시지 제거
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
      alert(`표지 생성 실패: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // 폼 유효성 검사 함수 (심화 과정)
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
      const created = await createBook({
        title: form.title.trim(),
        author: form.author.trim(),
        content: form.content.trim(),
        category: form.category,
        coverImageUrl: coverImage,
      });
      alert('등록되었습니다.');
      navigate(`/books/${created.id}`);
    } catch (err) {
      alert(`등록 실패: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <Link to="/books" className="back-btn">← 목록으로</Link>
        <h1 style={{ fontSize: 20 }}>신규 도서 등록</h1>
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
              placeholder="예) 별빛 아래의 서점"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title ? (
              <div className="error-msg">{errors.title}</div>
            ) : (
              <div className="form-help">공백만 입력 불가, 최대 50자</div>
            )}
          </div>

          <div className="form-group">
            <label>
              작가<span className="required">*</span>
            </label>
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="예) 홍길동"
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
              placeholder="책 내용을 입력하세요. AI 표지 생성에 활용됩니다."
              className={errors.content ? 'input-error' : ''}
            />
            {errors.content ? (
              <div className="error-msg">{errors.content}</div>
            ) : (
              <div className="form-help">최소 10자 이상, 2~4문장 권장 (AI 표지 품질에 영향)</div>
            )}
          </div>

          <div className="ai-section">
            <div className="ai-section-title">AI 표지 생성</div>
            <div className="ai-section-desc">
              제목과 내용을 기반으로 표지를 미리 생성합니다. 결과는 우측에 표시됩니다.
            </div>

            <div className="form-group">
              <label style={{ fontSize: 12 }}>OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <div className="form-help">조별 API Key 사용 · 저장되지 않음</div>
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
              <div className="form-help">HIGH일수록 품질 ↑ 비용 · 시간 ↑</div>
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
              {generating ? '생성 중... (수십초 소요)' : 'AI 표지 생성하기'}
            </button>
          </div>

          <div className="form-actions">
            <button className="btn" onClick={() => navigate('/books')} disabled={submitting || generating}>
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
                <div className="icon">▢</div>
                <div>
                  표지가 아직<br />생성되지 않았습니다
                </div>
              </>
            )}
          </div>
          <div className="preview-meta">생성 후 저장 시 함께 등록됩니다</div>
        </div>
      </div>
    </div>
  );
}

export default BookCreatePage;
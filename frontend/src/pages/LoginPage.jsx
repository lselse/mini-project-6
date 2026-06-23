import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      await login(form.username.trim(), form.password);
      alert('로그인되었습니다.');
      navigate('/books');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>로그인</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div style={{ padding: 10, background: '#fee', color: '#c0392b', borderRadius: 4, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#666' }}>
        아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </div>
    </div>
  );
}

export default LoginPage;

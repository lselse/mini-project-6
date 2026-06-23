import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = form.username.trim();
    if (!u || u.length < 3) return setError('아이디는 3자 이상이어야 합니다.');
    if (!form.password || form.password.length < 4) return setError('비밀번호는 4자 이상이어야 합니다.');
    if (form.password !== form.passwordConfirm) return setError('비밀번호 확인이 일치하지 않습니다.');

    try {
      setSubmitting(true);
      await signup(u, form.password);
      // 회원가입 성공 시 바로 로그인
      await login(u, form.password);
      alert('가입과 로그인이 완료되었습니다.');
      navigate('/books');
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>회원가입</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디 <span style={{ color: '#888', fontSize: 12 }}>(3자 이상)</span></label>
          <input name="username" value={form.username} onChange={handleChange} autoComplete="username" />
        </div>

        <div className="form-group">
          <label>비밀번호 <span style={{ color: '#888', fontSize: 12 }}>(4자 이상)</span></label>
          <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
        </div>

        <div className="form-group">
          <label>비밀번호 확인</label>
          <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} autoComplete="new-password" />
        </div>

        {error && (
          <div style={{ padding: 10, background: '#fee', color: '#c0392b', borderRadius: 4, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#666' }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}

export default SignupPage;

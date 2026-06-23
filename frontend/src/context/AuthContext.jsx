import { createContext, useContext, useEffect, useState } from 'react';
import {
  getToken,
  getUsername,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  changePassword as apiChangePassword,
  deleteAccount as apiDeleteAccount,
} from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username } 또는 null

  // 페이지 새로고침 시 localStorage에서 로그인 상태 복원
  useEffect(() => {
    if (getToken()) {
      setUser({ username: getUsername() });
    }
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    setUser({ username: data.username });
    return data;
  };

  const signup = async (username, password) => {
    return await apiSignup(username, password);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  // 비밀번호 변경 — 서버가 토큰을 무효화하므로 로컬도 로그아웃 처리
  const changePassword = async (currentPassword, newPassword) => {
    const data = await apiChangePassword(currentPassword, newPassword);
    setUser(null);
    return data;
  };

  // 회원 탈퇴 — 성공 시 로그인 상태 해제
  const deleteAccount = async () => {
    await apiDeleteAccount();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, signup, logout, changePassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  return ctx;
}

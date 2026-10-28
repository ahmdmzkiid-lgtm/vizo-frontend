import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vizo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('vizo_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const coordinatedCourseIds = (res.data.user.coordinatedCourses || []).map(
          (c) => c.course.id
        );
        const userData = {
          ...res.data.user,
          coordinatedCourseIds,
        };
        setUser(userData);
        localStorage.setItem('vizo_user', JSON.stringify(userData));
      } catch (err) {
        console.error('Session expired or invalid', err);
        localStorage.removeItem('vizo_token');
        localStorage.removeItem('vizo_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('vizo_token', res.data.token);
    localStorage.setItem('vizo_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('vizo_token', res.data.token);
    localStorage.setItem('vizo_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const changePassword = async (newPassword, currentPassword) => {
    const res = await api.put('/auth/change-password', { newPassword, currentPassword });
    const updated = { ...user, isDefaultPassword: false };
    setUser(updated);
    localStorage.setItem('vizo_user', JSON.stringify(updated));
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('vizo_token');
    localStorage.removeItem('vizo_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isKetuaKelas = user?.role === 'KETUA_KELAS';
  const isPJMatkul = user?.role === 'PJ_MATKUL' || isKetuaKelas;

  const canManageCourse = (courseId) => {
    if (isKetuaKelas) return true;
    if (!user || !user.coordinatedCourseIds) return false;
    return user.coordinatedCourseIds.includes(Number(courseId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        changePassword,
        isKetuaKelas,
        isPJMatkul,
        canManageCourse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

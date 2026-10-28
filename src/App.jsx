import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar, { TopHeader } from './components/Navbar';
import ForceChangePasswordModal from './components/ForceChangePasswordModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import DeadlineBoard from './pages/DeadlineBoard';
import ManageCoordinators from './pages/ManageCoordinators';
import ScheduleCalendar from './pages/ScheduleCalendar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[13px] font-medium text-[#64748B] bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full border-2 border-[#1D63FF] border-t-transparent animate-spin" />
          <span>Memuat Vizo...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen flex bg-white text-[#1E293B] md:overflow-hidden">
      {/* Left Sidebar (Fixed on Desktop, Bottom Nav on Mobile) */}
      <Navbar />
      <ForceChangePasswordModal />

      {/* Right Column: Sticky Top Header + Scrollable Main Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto bg-white">
        <TopHeader />

        <main className="flex-1 pb-20 md:pb-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <ScheduleCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deadlines"
              element={
                <ProtectedRoute>
                  <DeadlineBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-coordinators"
              element={
                <ProtectedRoute>
                  <ManageCoordinators />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

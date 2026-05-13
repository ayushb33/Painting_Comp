import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSchools from './pages/admin/Schools';
import PaintingApproval from './pages/admin/PaintingApproval';
import Verification from './pages/admin/Verification';
import AdminLeaderboard from './pages/admin/Leaderboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudents from './pages/teacher/Students';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherResults from './pages/teacher/Results';
import TeacherProfile from './pages/teacher/Profile';
import JudgeDashboard from './pages/judge/Dashboard';
import HomePage from './pages/Home';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/schools" element={<ProtectedRoute role="ADMIN"><AdminSchools /></ProtectedRoute>} />
          <Route path="/admin/paintings" element={<ProtectedRoute role="ADMIN"><PaintingApproval /></ProtectedRoute>} />
          <Route path="/admin/verification" element={<ProtectedRoute role="ADMIN"><Verification /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute role="ADMIN"><AdminLeaderboard /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute role="TEACHER"><TeacherStudents /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute role="TEACHER"><TeacherAttendance /></ProtectedRoute>} />
          <Route path="/teacher/results" element={<ProtectedRoute role="TEACHER"><TeacherResults /></ProtectedRoute>} />
          <Route path="/teacher/profile" element={<ProtectedRoute role="TEACHER"><TeacherProfile /></ProtectedRoute>} />
          <Route path="/judge" element={<ProtectedRoute role="JUDGE"><JudgeDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
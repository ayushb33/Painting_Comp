import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/ui/Loader';
import { Users, ClipboardList, Image, BarChart2, UserCircle, AlertTriangle } from 'lucide-react';

const TEACHER_LINKS = [
  { to: '/teacher', label: 'Dashboard', icon: BarChart2 },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/attendance', label: 'Attendance & Upload', icon: ClipboardList },
  { to: '/teacher/results', label: 'Results', icon: BarChart2 },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['my-students'],
    queryFn: () => api.get('/teacher/students', { params: { limit: 100 } }).then(r => r.data.data),
  });

  const students = studentsData?.students || [];
  const present = students.filter(s => s.attendance?.is_present).length;
  const submitted = students.filter(s => s.painting).length;
  const approved = students.filter(s => s.painting?.is_approved).length;

  return (
    <div className="flex">
      <Sidebar links={TEACHER_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        {!user?.profile_completed && (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 mb-6">
            <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Your profile is incomplete. <Link to="/teacher/profile" className="font-semibold underline">Complete your profile</Link> to unlock all features.
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.teacher_name}!</h1>
        <p className="text-gray-500 text-sm mb-6">{user?.school_name}</p>

        {isLoading ? <Loader /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Students', value: students.length, color: 'border-blue-500', to: '/teacher/students' },
              { label: 'Present Today', value: present, color: 'border-green-500', to: '/teacher/attendance' },
              { label: 'Paintings Submitted', value: submitted, color: 'border-purple-500', to: '/teacher/attendance' },
              { label: 'Paintings Approved', value: approved, color: 'border-orange-500', to: '/teacher/attendance' },
            ].map(({ label, value, color, to }) => (
              <Link key={label} to={to}
                className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color} hover:shadow-md transition`}>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
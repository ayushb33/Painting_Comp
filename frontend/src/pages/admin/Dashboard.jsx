import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/ui/Loader';
import { LayoutDashboard, School, Image, CheckSquare, Trophy } from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/schools', label: 'Schools', icon: School },
  { to: '/admin/paintings', label: 'Painting Approval', icon: Image },
  { to: '/admin/verification', label: 'Verification', icon: CheckSquare },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
  });

  return (
    <div className="flex">
      <Sidebar links={ADMIN_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {isLoading ? <Loader /> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard label="Total Schools" value={data?.totalSchools} color="border-blue-500" />
              <StatCard label="Total Students" value={data?.totalStudents} color="border-green-500" />
              <StatCard label="Paintings Uploaded" value={data?.totalPaintings} color="border-purple-500" />
              <StatCard label="Paintings Approved" value={data?.approvedPaintings} color="border-orange-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Top Schools by Registration</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-500">School</th>
                      <th className="text-left py-2 text-gray-500">State</th>
                      <th className="text-right py-2 text-gray-500">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.schoolStats?.map(s => (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-900">{s.school_name}</td>
                        <td className="py-2.5 text-gray-500">{s.state || '—'}</td>
                        <td className="py-2.5 text-right font-semibold">{s._count.students}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
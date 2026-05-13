import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/ui/Loader';
import { Users, ClipboardList, BarChart2, UserCircle, Trophy } from 'lucide-react';

const TEACHER_LINKS = [
  { to: '/teacher', label: 'Dashboard', icon: BarChart2 },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/attendance', label: 'Attendance & Upload', icon: ClipboardList },
  { to: '/teacher/results', label: 'Results', icon: BarChart2 },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
];

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '🏅', 5: '🏅' };

export default function TeacherResults() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-results'],
    queryFn: () => api.get('/teacher/results').then(r => r.data.data),
  });

  return (
    <div className="flex">
      <Sidebar links={TEACHER_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Results</h1>

        {isLoading ? <Loader /> : (
          !data?.published ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-blue-50 rounded-full p-6 mb-5">
                <Trophy size={48} className="text-blue-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Results Not Yet Announced</h2>
              <p className="text-gray-400 max-w-sm">
                Results will be announced soon. Check back later or contact the competition organizers.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white text-center">
                <Trophy size={40} className="mx-auto mb-2 text-yellow-300" />
                <h2 className="text-2xl font-bold">🎉 Results Announced!</h2>
                <p className="text-blue-200 text-sm mt-1">Top 5 students from your school</p>
              </div>

              <div className="space-y-3">
                {data.results.map(r => (
                  <div key={r.id}
                    className={`bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4 ${r.rank === 1 ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                    <span className="text-3xl">{RANK_MEDALS[r.rank]}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{r.student.full_name}</p>
                      <p className="text-gray-500 text-sm">
                        Class {r.student.class}-{r.student.section} &bull; {r.student.unique_student_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{r.score.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">out of 100</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-700 text-sm font-medium">🏆 Certificates will be mailed to you on your registered Email ID soon!</p>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
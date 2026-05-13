import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
const getRankDisplay = (rank) => RANK_MEDALS[rank] || `${rank}th`;

const RANK_BG = {
  1: 'bg-yellow-50 border-l-4 border-yellow-400',
  2: 'bg-gray-50 border-l-4 border-gray-300',
  3: 'bg-orange-50 border-l-4 border-orange-300',
};

export default function AdminLeaderboard() {
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/admin/leaderboard').then(r => r.data.data),
  });

  // ── Derived data ─────────────────────────────────────────────────────────────

  // Overall leaderboard — all students sorted by score desc, re-ranked globally
  const overallRanked = data
    ? [...data]
        .sort((a, b) => b.score - a.score)
        .map((r, idx) => ({ ...r, overall_rank: idx + 1 }))
    : [];

  // Unique schools from results
  const schools = data
    ? [...new Map(data.map(r => [r.school_id, r.school])).values()]
        .sort((a, b) => a.school_name.localeCompare(b.school_name))
    : [];

  // School-wise filtered results
  const schoolResults = selectedSchoolId
    ? data
        ?.filter(r => r.school_id === parseInt(selectedSchoolId))
        .sort((a, b) => a.rank - b.rank)
    : null;

  const selectedSchoolName = schools.find(s => s.school_name && parseInt(selectedSchoolId))
    ? data?.find(r => r.school_id === parseInt(selectedSchoolId))?.school?.school_name
    : '';

  return (
    <div className="flex">
      <Sidebar links={ADMIN_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">

        <div className="flex items-center gap-3 mb-1">
          <Trophy size={24} className="text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">
          Published results across all schools.
        </p>

        {isLoading ? <Loader /> : data?.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Trophy size={52} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No published results yet</p>
            <p className="text-sm mt-1">Publish results from the Verification page.</p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── Section 1: Overall Leaderboard ──────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🌐</span>
                <h2 className="text-lg font-bold text-gray-800">Overall Rankings</h2>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  {overallRanked.length} participants
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Rank', 'Name', 'School', 'State', 'Class', 'Score'].map(h => (
                        <th key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overallRanked.map(r => (
                      <tr key={r.id}
                        className={`border-b last:border-0 transition hover:brightness-95 ${RANK_BG[r.overall_rank] || 'hover:bg-gray-50'}`}>
                        <td className="px-5 py-3 text-xl w-16">
                          {getRankDisplay(r.overall_rank)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-900">
                          {r.student.full_name}
                        </td>
                        <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate">
                          {r.school.school_name}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {r.school.state || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          Class {r.student.class}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-bold text-blue-600 text-base">
                            {r.score.toFixed(1)}
                          </span>
                          <span className="text-gray-300 text-xs">/100</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Section 2: School-wise Leaderboard ──────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🏫</span>
                <h2 className="text-lg font-bold text-gray-800">School-wise Rankings</h2>
              </div>

              {/* School selector */}
              <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a school to view its leaderboard
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={e => setSelectedSchoolId(e.target.value)}
                  className="w-full md:w-96 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a school --</option>
                  {schools.map(s => {
                    const schoolResult = data?.find(r => r.school.school_name === s.school_name);
                    const count = data?.filter(r => r.school.school_name === s.school_name).length;
                    return (
                      <option key={schoolResult?.school_id} value={schoolResult?.school_id}>
                        {s.school_name} ({count} ranked)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* School results table */}
              {selectedSchoolId && schoolResults ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* School header */}
                  <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <h3 className="font-bold text-xl">
                      {data?.find(r => r.school_id === parseInt(selectedSchoolId))?.school?.school_name}
                    </h3>
                    <p className="text-blue-200 text-sm mt-0.5">
                      {data?.find(r => r.school_id === parseInt(selectedSchoolId))?.school?.state || '—'}
                      &nbsp;&bull;&nbsp;{schoolResults.length} students ranked
                    </p>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {['Rank', 'Student ID', 'Name', 'Class', 'Score'].map(h => (
                          <th key={h}
                            className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schoolResults.map(r => (
                        <tr key={r.id}
                          className={`border-b last:border-0 transition ${RANK_BG[r.rank] || 'hover:bg-gray-50'}`}>
                          <td className="px-5 py-3 text-xl w-16">
                            {getRankDisplay(r.rank)}
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-gray-400">
                            {r.student.unique_student_id}
                          </td>
                          <td className="px-5 py-3 font-semibold text-gray-900">
                            {r.student.full_name}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            Class {r.student.class}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {/* Score bar */}
                              <div className="w-24 bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${r.score}%` }}
                                />
                              </div>
                              <span className="font-bold text-blue-600">
                                {r.score.toFixed(1)}
                              </span>
                              <span className="text-gray-300 text-xs">/100</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedSchoolId && !schoolResults?.length ? (
                <div className="bg-white rounded-xl p-10 text-center text-gray-400">
                  No published results for this school yet.
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
                  <School size={36} className="mx-auto mb-3 opacity-30" />
                  <p>Select a school above to view its rankings</p>
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
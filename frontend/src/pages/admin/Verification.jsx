import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { LayoutDashboard, School, Image, CheckSquare, Trophy } from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/schools', label: 'Schools', icon: School },
  { to: '/admin/paintings', label: 'Painting Approval', icon: Image },
  { to: '/admin/verification', label: 'Verification', icon: CheckSquare },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Verification() {
  const qc = useQueryClient();
  const [viewStudents, setViewStudents] = useState(null);
  const [publishConfirm, setPublishConfirm] = useState(null);
  const [unpublishConfirm, setUnpublishConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['verification'],
    queryFn: () => api.get('/admin/verification').then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['school-students', viewStudents],
    queryFn: () => api.get(`/admin/schools/${viewStudents}/students`).then(r => r.data.data),
    enabled: !!viewStudents,
  });

  const { mutate: publishResults } = useMutation({
    mutationFn: (schoolId) => api.post(`/admin/results/school/${schoolId}/publish`),
    onSuccess: () => { toast.success('Results published!'); qc.invalidateQueries({ queryKey: ['verification'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish'),
  });

  const { mutate: unpublishResults } = useMutation({
    mutationFn: (schoolId) => api.patch(`/admin/results/school/${schoolId}/unpublish`),
    onSuccess: () => { toast.success('Results unpublished'); qc.invalidateQueries({ queryKey: ['verification'] }); },
    onError: () => toast.error('Failed to unpublish'),
  });

  const getStatus = (row) => {
    if (row.results_published) return { label: 'Published', variant: 'success' };
    if (row.all_approved && row.submissions > 0) return { label: 'Ready', variant: 'info' };
    if (row.submissions > 0) return { label: 'Pending Approval', variant: 'warning' };
    return { label: 'No Submissions', variant: 'gray' };
  };

  return (
    <div className="flex">
      <Sidebar links={ADMIN_LINKS} />
      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Painting Verification</h1>
        <p className="text-gray-500 text-sm mb-6">Track attendance, submissions, and publish results school-wise.</p>

        {isLoading ? <Loader /> : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['School', 'State', 'Registered', 'Present', 'Submissions', 'Present No Submission', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.map(row => {
                  const status = getStatus(row);
                  return (
                    <tr key={row.school_id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{row.school_name}</td>
                      <td className="px-4 py-3 text-gray-500">{row.state || '—'}</td>
                      <td className="px-4 py-3 text-center font-medium">{row.registered}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-green-600">{row.present}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-blue-600">{row.submissions}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.present_no_submission > 0 ? (
                          <span className="font-medium text-red-500">{row.present_no_submission}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={status.label} variant={status.variant} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setViewStudents(row.school_id)}
                            className="text-xs px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700"
                          >
                            View Students
                          </button>
                          {!row.results_published ? (
                            <button
                              onClick={() => setPublishConfirm(row.school_id)}
                              disabled={row.submissions === 0}
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40"
                            >
                              Publish Results
                            </button>
                          ) : (
                            <button
                              onClick={() => setUnpublishConfirm(row.school_id)}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              Undo Publish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View Students Modal */}
        <Modal isOpen={!!viewStudents} onClose={() => setViewStudents(null)} title="Student Details" size="xl">
          {studentsLoading ? <Loader /> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Student ID', 'Name', 'Class', 'Attendance', 'Submission', 'Avg Score'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students?.map(s => {
                  const avg = s.painting?.scores?.length
                    ? (s.painting.scores.reduce((sum, sc) => sum + sc.total_score, 0) / s.painting.scores.length).toFixed(1)
                    : '—';
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono text-xs text-gray-400">{s.unique_student_id}</td>
                      <td className="px-3 py-2 font-medium">{s.full_name}</td>
                      <td className="px-3 py-2">{s.class}-{s.section}</td>
                      <td className="px-3 py-2">
                        <Badge label={s.attendance?.is_present ? 'Present' : 'Absent'} variant={s.attendance?.is_present ? 'success' : 'danger'} />
                      </td>
                      <td className="px-3 py-2">
                        <Badge label={s.painting ? 'Submitted' : 'Not Submitted'} variant={s.painting ? 'info' : 'gray'} />
                      </td>
                      <td className="px-3 py-2 font-semibold">{avg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Modal>

        <ConfirmDialog
          isOpen={!!publishConfirm}
          onClose={() => setPublishConfirm(null)}
          onConfirm={() => publishResults(publishConfirm)}
          title="Publish Results"
          message="This will calculate top 5 students based on judge scores and make results visible to the school. Continue?"
          confirmLabel="Publish"
        />
        <ConfirmDialog
          isOpen={!!unpublishConfirm}
          onClose={() => setUnpublishConfirm(null)}
          onConfirm={() => unpublishResults(unpublishConfirm)}
          title="Undo Publish"
          message="Results will be hidden from the school. You can re-publish anytime."
          confirmLabel="Undo Publish"
          danger
        />
      </main>
    </div>
  );
}
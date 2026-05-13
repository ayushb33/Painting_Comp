import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import {
  LayoutDashboard, School, Image, CheckSquare,
  Trophy, Plus, Download, Eye
} from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/schools', label: 'Schools', icon: School },
  { to: '/admin/paintings', label: 'Painting Approval', icon: Image },
  { to: '/admin/verification', label: 'Verification', icon: CheckSquare },
  { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const EMPTY_FORM = {
  school_name: '',
  teacher_name: '',
  email: '',
  password: '',
  contact_number: '',
  city: '',
  state: '',
};

export default function AdminSchools() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [viewStudentsSchoolId, setViewStudentsSchoolId] = useState(null);
  const [stateFilter, setStateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);

  // ── Fetch Schools ────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['admin-schools', stateFilter, search, page],
    queryFn: () =>
      api
        .get('/admin/schools', { params: { state: stateFilter, search, page, limit: 20 } })
        .then(r => r.data.data),
    keepPreviousData: true,
  });

  // ── Fetch Students for Modal ─────────────────────────────────────────────────
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['school-students', viewStudentsSchoolId],
    queryFn: () =>
      api
        .get(`/admin/schools/${viewStudentsSchoolId}/students`)
        .then(r => r.data.data),
    enabled: !!viewStudentsSchoolId,
  });

  // ── Create School ────────────────────────────────────────────────────────────
  const { mutate: createSchool, isPending: createPending } = useMutation({
    mutationFn: (d) => api.post('/admin/schools', d),
    onSuccess: () => {
      toast.success('School registered successfully!');
      qc.invalidateQueries({ queryKey: ['admin-schools'] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Failed to create school'),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    window.open('/api/admin/schools/export', '_blank');
  };

  const handleFormChange = (key) => (e) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleCloseCreate = () => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
  };

  const handleCloseStudents = () => setViewStudentsSchoolId(null);

  const pagination = data?.pagination;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex">
      <Sidebar links={ADMIN_LINKS} />

      <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
            <p className="text-gray-500 text-sm mt-1">
              {pagination?.total ?? '—'} schools registered
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Plus size={14} /> Register School
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by school name or teacher..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={stateFilter}
            onChange={e => { setStateFilter(e.target.value); setPage(1); }}
            className="sm:w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            {INDIA_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <Loader />
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      'School Name', 'Teacher', 'Email',
                      'City', 'State', 'Students',
                      'Profile', 'Registered', 'Actions'
                    ].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.schools?.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-14 text-gray-400">
                        No schools found. Register a school to get started.
                      </td>
                    </tr>
                  )}
                  {data?.schools?.map(school => (
                    <tr
                      key={school.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {school.school_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {school.teacher_name}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {school.email}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {school.city || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {school.state || '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">
                        {school._count.students}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={school.profile_completed ? 'Complete' : 'Incomplete'}
                          variant={school.profile_completed ? 'success' : 'warning'}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(school.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewStudentsSchoolId(school.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap transition"
                        >
                          <Eye size={13} /> View Students
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm">
                <p className="text-gray-500 text-xs">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 rounded-md text-xs border transition ${
                            p === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )
                  }
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Create School Modal ────────────────────────────────────────────── */}
        <Modal
          isOpen={showCreate}
          onClose={handleCloseCreate}
          title="Register New School"
          size="md"
        >
          <form
            onSubmit={e => { e.preventDefault(); createSchool(form); }}
            className="space-y-4"
          >
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.school_name}
                onChange={handleFormChange('school_name')}
                placeholder="e.g. Delhi Public School"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Teacher Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.teacher_name}
                onChange={handleFormChange('teacher_name')}
                placeholder="e.g. Priya Sharma"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Email <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={handleFormChange('email')}
                placeholder="teacher@school.edu.in"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={handleFormChange('password')}
                placeholder="Min 8 characters"
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Contact (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.contact_number}
                onChange={handleFormChange('contact_number')}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* City (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={handleFormChange('city')}
                placeholder="e.g. Mumbai"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* State (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <select
                value={form.state}
                onChange={handleFormChange('state')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select State</option>
                {INDIA_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button
                type="button"
                onClick={handleCloseCreate}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {createPending ? 'Creating...' : 'Register School'}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── View Students Modal ────────────────────────────────────────────── */}
        <Modal
          isOpen={!!viewStudentsSchoolId}
          onClose={handleCloseStudents}
          title="School Students"
          size="xl"
        >
          {studentsLoading ? (
            <Loader text="Loading students..." />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {students?.length ?? 0} student(s) registered
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {[
                        'Student ID', 'Name', 'Class',
                        "Father's Name", 'Adm. No.',
                        'Attendance', 'Submission', 'Avg Score'
                      ].map(h => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students?.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-400">
                          No students registered yet.
                        </td>
                      </tr>
                    )}
                    {students?.map(s => {
                      const avgScore =
                        s.painting?.scores?.length
                          ? (
                              s.painting.scores.reduce(
                                (sum, sc) => sum + sc.total_score, 0
                              ) / s.painting.scores.length
                            ).toFixed(1)
                          : '—';

                      return (
                        <tr
                          key={s.id}
                          className="border-b last:border-0 hover:bg-gray-50 transition"
                        >
                          <td className="px-3 py-2.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                            {s.unique_student_id}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900 whitespace-nowrap">
                            {s.full_name}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">
                            {s.class}-{s.section}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                            {s.father_name}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500">
                            {s.admission_number}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              label={s.attendance?.is_present ? 'Present' : 'Absent'}
                              variant={s.attendance?.is_present ? 'success' : 'danger'}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              label={
                                s.painting?.is_approved
                                  ? 'Approved'
                                  : s.painting
                                  ? 'Submitted'
                                  : 'Not Submitted'
                              }
                              variant={
                                s.painting?.is_approved
                                  ? 'success'
                                  : s.painting
                                  ? 'info'
                                  : 'gray'
                              }
                            />
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-gray-800">
                            {avgScore !== '—' ? (
                              <>
                                <span className="text-blue-600">{avgScore}</span>
                                <span className="text-gray-300 text-xs">/100</span>
                              </>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal>

      </main>
    </div>
  );
}